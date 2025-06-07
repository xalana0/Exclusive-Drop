// components/Conta.js (ou pages/conta.js, dependendo de onde você o está a usar)
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  
} from 'firebase/firestore';

import { FaUser, FaUsers, FaBox, FaHistory, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaSearch, FaKey, FaEnvelope } from 'react-icons/fa';




const Conta = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState(router.query.tab || 'conta'); // Default para 'conta' ou da URL
  const [loading, setLoading] = useState(true); // Novo estado de carregamento
  const [errorMessage, setErrorMessage] = useState('');


  // State for Account Tab
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState(''); // Mensagens para feedback de password

  // State for Users Tab (Admin)
  const [userList, setUserList] = useState([]);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', isAdmin: false });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', isAdmin: false });
  const [searchTermUsers, setSearchTermUsers] = useState('');
  const [filteredUserList, setFilteredUserList] = useState([]);


  // State for Products Tab (Admin)
  const [products, setProducts] = useState([]);
  const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);
  const [editProductData, setEditProductData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    inStock: true,
    stock: { 38: 0, 39: 0, 40: 0, 41: 0, 42: 0 }, // Exemplo de tamanhos
    sketchfabUrl: '' // Novo campo para Sketchfab
  });
    const [imageInputType, setImageInputType] = useState('url'); // 'url' ou 'upload'
  const [imageFile, setImageFile] = useState(null); // Para guardar o ficheiro selecionado
  const [uploadingImage, setUploadingImage] = useState(false); // Para gerir o estado de carregamento da imagem
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    inStock: true,
    stock: { 38: 0, 39: 0, 40: 0, 41: 0, 42: 0 },
    sketchfabUrl: ''
  });
  const [searchTermProducts, setSearchTermProducts] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setUploadingImage(true);
      try {
        const storageRef = ref(storage, `product_images/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setNewProduct(prev => ({ ...prev, image: downloadURL }));
        // setErrorMessage(null); // Opcional: limpar mensagens de erro anteriores se houver
      } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        // setErrorMessage("Erro ao fazer upload da imagem. Por favor, tente novamente.");
        setNewProduct(prev => ({ ...prev, image: '' })); // Limpar a imagem em caso de erro
      } finally {
        setUploadingImage(false);
      }
    }
  };
  // State for Orders Tab
  const [userOrders, setUserOrders] = useState([]); // Para o utilizador atual
  const [allOrders, setAllOrders] = useState([]); // Para administradores verem todos os pedidos
  const [usersMap, setUsersMap] = useState({}); // Para mapear userId a username/email em pedidos

  // --- Funções de Carregamento de Dados ---

  const fetchUserData = useCallback(async () => {
    if (session?.user?.id) {
      try {
        const userDocRef = doc(db, 'users', session.user.id);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData({ id: userDocSnap.id, ...userDocSnap.data() });
          setIsAdmin(userDocSnap.data().isAdmin || false);
          setEditName(userDocSnap.data().username || '');
          setEditEmail(userDocSnap.data().email || '');
        } else {
          console.error("Dados do utilizador não encontrados no Firestore.");
          setErrorMessage("Erro: Dados do utilizador não encontrados.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do utilizador:", error);
        setErrorMessage("Erro ao carregar dados do utilizador.");
      }
    }
  }, [session]);

  const fetchUserList = useCallback(async () => {
    try {
      const usersCol = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCol);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserList(usersData);
      setFilteredUserList(usersData); // Inicializa a lista filtrada
    } catch (error) {
      console.error("Erro ao carregar lista de utilizadores:", error);
      setErrorMessage("Erro ao carregar lista de utilizadores.");
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const productsCol = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCol);
      const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      setFilteredProducts(productsData); // Inicializa a lista filtrada
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setErrorMessage("Erro ao carregar produtos.");
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const ordersCol = collection(db, 'orders');
      // Pedidos do utilizador atual
      const userOrdersQuery = query(ordersCol, where('userId', '==', session.user.id), orderBy('orderDate', 'desc'));
      const userOrdersSnapshot = await getDocs(userOrdersQuery);
      setUserOrders(userOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Todos os pedidos (apenas para admin)
      if (isAdmin) {
        const allOrdersQuery = query(ordersCol, orderBy('orderDate', 'desc'));
        const allOrdersSnapshot = await getDocs(allOrdersQuery);
        const allOrdersData = allOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllOrders(allOrdersData);

        // Mapear IDs de utilizador para nomes/emails para exibição
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersMapData = {};
        usersSnapshot.docs.forEach(userDoc => {
          usersMapData[userDoc.id] = userDoc.data().username || userDoc.data().email || 'Desconhecido';
        });
        setUsersMap(usersMapData);
      }

    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setErrorMessage("Erro ao carregar pedidos.");
    }
  }, [session, isAdmin]);


  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    const loadAllData = async () => {
      setLoading(true);
      setErrorMessage(''); // Limpa mensagens de erro anteriores
      await fetchUserData();
      // Não carrega tudo de uma vez, mas sim quando a aba é ativada
      // para otimizar o desempenho, mas mantive o carregamento inicial para a conta.
      setLoading(false);
    };

    loadAllData();

    // Carregar dados específicos da aba quando ela é ativada
    if (activeTab === 'utilizadores' && isAdmin) {
      fetchUserList();
    } else if (activeTab === 'produtos' && isAdmin) {
      fetchProducts();
    } else if (activeTab === 'historico-compras-pessoal' || (activeTab === 'historico-compras-utilizador' && isAdmin)) {
      fetchOrders();
    }


  }, [session, status, router, fetchUserData, fetchUserList, fetchProducts, fetchOrders, isAdmin, activeTab]); // Adicionado activeTab


  // --- Funções da Aba "Minha Conta" ---

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!userData?.id) return;
    try {
      const userDocRef = doc(db, 'users', userData.id);
      await updateDoc(userDocRef, {
        username: editName,
        email: editEmail,
      });
      setUserData(prev => ({ ...prev, username: editName, email: editEmail }));
      setIsEditingProfile(false);
      setErrorMessage('');
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setErrorMessage("Erro ao salvar perfil.");
      alert('Erro ao atualizar perfil.');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmNewPassword) {
      setPasswordMessage('As novas palavras-passe não correspondem.');
      return;
    }
    if (newPassword.length < 6) { // Exemplo de validação
      setPasswordMessage('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      // Esta lógica é para o NextAuth, não para Firebase Auth diretamente.
      // A mudança de senha para Credenciais no NextAuth geralmente envolve a API do seu backend.
      // Se você estiver a usar Firebase Authentication, a lógica seria diferente (e.g., updatePassword(user, newPassword)).
      // Para este exemplo, apenas simulamos uma mensagem de sucesso/erro.
      setPasswordMessage('Funcionalidade de mudança de palavra-passe desativada para este exemplo. Implemente a sua lógica de backend.');
      setNewPassword('');
      setConfirmNewPassword('');
      // alert('Senha alterada com sucesso! (Funcionalidade simulada)');
    } catch (error) {
      console.error("Erro ao mudar palavra-passe:", error);
      setPasswordMessage('Erro ao mudar palavra-passe.');
    }
  };


  // --- Funções da Aba "Utilizadores" (Admin) ---

  useEffect(() => {
    const lowercasedSearchTerm = searchTermUsers.toLowerCase();
    const filtered = userList.filter(user =>
      (user.username && user.username.toLowerCase().includes(lowercasedSearchTerm)) ||
      (user.email && user.email.toLowerCase().includes(lowercasedSearchTerm))
    );
    setFilteredUserList(filtered);
  }, [searchTermUsers, userList]);

  const handleEditUser = (user) => {
    setSelectedUserToEdit(user);
    setEditUserData({ username: user.username, email: user.email, isAdmin: user.isAdmin });
  };

  const handleSaveEditedUser = async () => {
    if (!selectedUserToEdit?.id) return;
    try {
      const userDocRef = doc(db, 'users', selectedUserToEdit.id);
      await updateDoc(userDocRef, {
        username: editUserData.username,
        email: editUserData.email,
        isAdmin: editUserData.isAdmin,
      });
      alert('Utilizador atualizado com sucesso!');
      setSelectedUserToEdit(null);
      fetchUserList(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao salvar utilizador:", error);
      alert('Erro ao atualizar utilizador.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem a certeza que deseja eliminar este utilizador?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        alert('Utilizador eliminado com sucesso!');
        fetchUserList(); // Recarrega a lista
      } catch (error) {
        console.error("Erro ao eliminar utilizador:", error);
        alert('Erro ao eliminar utilizador.');
      }
    }
  };

  const handleCreateUser = async () => {
    // Validação básica
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('Por favor, preencha todos os campos para criar um novo utilizador.');
      return;
    }

    try {
      // Hash da senha (importante para segurança)
      const hashedPassword = await bcrypt.hash(newUser.password, 10); // bcrypt deve ser importado se for usado
      await addDoc(collection(db, 'users'), {
        username: newUser.username,
        email: newUser.email,
        password: hashedPassword, // Salvar a senha HASHED
        isAdmin: newUser.isAdmin,
        createdAt: new Date(),
      });
      alert('Utilizador criado com sucesso!');
      setIsCreatingUser(false);
      setNewUser({ username: '', email: '', password: '', isAdmin: false });
      fetchUserList(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao criar utilizador:", error);
      alert('Erro ao criar utilizador.');
    }
  };


  // --- Funções da Aba "Produtos" (Admin) ---

  useEffect(() => {
    const lowercasedSearchTerm = searchTermProducts.toLowerCase();
    const filtered = products.filter(product =>
      (product.name && product.name.toLowerCase().includes(lowercasedSearchTerm)) ||
      (product.category && product.category.toLowerCase().includes(lowercasedSearchTerm)) ||
      (product.description && product.description.toLowerCase().includes(lowercasedSearchTerm))
    );
    setFilteredProducts(filtered);
  }, [searchTermProducts, products]);

  const handleEditProduct = (product) => {
    setSelectedProductToEdit(product);
    setEditProductData({ ...product, stock: product.stock || { 38: 0, 39: 0, 40: 0, 41: 0, 42: 0 } });
  };

  const handleSaveEditedProduct = async () => {
    if (!selectedProductToEdit?.id) return;
    try {
      const productDocRef = doc(db, 'products', selectedProductToEdit.id);
      await updateDoc(productDocRef, { ...editProductData });
      alert('Produto atualizado com sucesso!');
      setSelectedProductToEdit(null);
      fetchProducts(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert('Erro ao atualizar produto.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem a certeza que deseja eliminar este produto?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        alert('Produto eliminado com sucesso!');
        fetchProducts(); // Recarrega a lista
      } catch (error) {
        console.error("Erro ao eliminar produto:", error);
        alert('Erro ao eliminar produto.');
      }
    }
  };

  const handleCreateProduct = async () => {
    // Validação básica
    if (!newProduct.name || !newProduct.price || !newProduct.image || !newProduct.category) {
      alert('Por favor, preencha os campos obrigatórios para criar um produto.');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), { ...newProduct, createdAt: new Date() });
      alert('Produto criado com sucesso!');
      setIsCreatingProduct(false);
      setNewProduct({ name: '', description: '', price: 0, image: '', category: '', inStock: true, stock: { 38: 0, 39: 0, 40: 0, 41: 0, 42: 0 }, sketchfabUrl: '' });
      fetchProducts(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      alert('Erro ao criar produto.');
    }
  };


  if (status === 'loading' || loading) {
    return (
      <div className="account-container" style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
        <h2>Carregando dados...</h2>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="account-container" style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
        <h2>Acesso não autorizado. Por favor, faça login.</h2>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'conta':
        return (
          <div className="tab-content profile-section">
            <h2>Bem-vindo, {userData?.username || session.user.username}!</h2>
            {isEditingProfile ? (
              <div className="edit-profile-form">
                <div className="form-group">
                  <label>Nome de Utilizador:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div className="actions">
                  <button className="save-btn" onClick={handleSaveProfile}>Salvar</button>
                  <button className="cancel-btn" onClick={() => setIsEditingProfile(false)}>Cancelar</button>
                </div>
                <hr style={{ margin: '2rem 0', borderColor: 'rgba(255,255,255,0.2)' }} />
                <h3>Mudar Palavra-Passe</h3>
                <div className="form-group">
                  <label>Nova Palavra-Passe:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Confirmar Nova Palavra-Passe:</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                {passwordMessage && <p style={{ color: passwordMessage.includes('sucesso') ? 'lightgreen' : 'red', marginTop: '10px' }}>{passwordMessage}</p>}
                <div className="actions">
                  <button className="edit-btn" onClick={handleChangePassword}>Mudar Palavra-Passe</button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <p><strong>Nome de Utilizador:</strong> {userData?.username || 'N/A'}</p>
                <p><strong>Email:</strong> {userData?.email || 'N/A'}</p>
                <p><strong>Tipo de Conta:</strong> {isAdmin ? 'Administrador' : 'Utilizador Padrão'}</p>
                <div className="actions">
                  <button className="edit-btn" onClick={handleEditProfile}>Editar Perfil</button>
                </div>
              </div>
            )}
          </div>
        );
      case 'utilizadores':
        if (!isAdmin) return <p className="no-permission-message">Acesso negado. Apenas administradores.</p>;
        return (
          <div className="tab-content">
            <h2>Gestão de Utilizadores</h2>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar utilizadores..."
                value={searchTermUsers}
                onChange={(e) => setSearchTermUsers(e.target.value)}
              />
            </div>
            <button className="add-btn" onClick={() => setIsCreatingUser(true)}>
              <FaPlus /> Adicionar Novo Utilizador
            </button>

            {isCreatingUser && (
              <div className="form-modal">
                <h3>Criar Novo Utilizador</h3>
                <div className="form-group">
                  <label>Nome de Utilizador:</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Palavra-Passe:</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="isAdminNew"
                    checked={newUser.isAdmin}
                    onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  />
                  <label htmlFor="isAdminNew">Administrador</label>
                </div>
                <div className="actions">
                  <button className="save-btn" onClick={handleCreateUser}>Criar</button>
                  <button className="cancel-btn" onClick={() => setIsCreatingUser(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {selectedUserToEdit && (
              <div className="form-modal">
                <h3>Editar Utilizador: {selectedUserToEdit.username}</h3>
                <div className="form-group">
                  <label>Nome de Utilizador:</label>
                  <input
                    type="text"
                    value={editUserData.username}
                    onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  />
                </div>
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="isAdminEdit"
                    checked={editUserData.isAdmin}
                    onChange={(e) => setEditUserData({ ...editUserData, isAdmin: e.target.checked })}
                  />
                  <label htmlFor="isAdminEdit">Administrador</label>
                </div>
                <div className="actions">
                  <button className="save-btn" onClick={handleSaveEditedUser}>Salvar</button>
                  <button className="cancel-btn" onClick={() => setSelectedUserToEdit(null)}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="user-list">
              {filteredUserList.length === 0 ? (
                <p className="no-items-message">Nenhum utilizador encontrado.</p>
              ) : (
                filteredUserList.map((user) => (
                  <div key={user.id} className="user-item">
                    <span>{user.username} ({user.email}) - {user.isAdmin ? 'Admin' : 'Utilizador'}</span>
                    <div className="actions">
                      <button className="edit-btn" onClick={() => handleEditUser(user)}><FaEdit /></button>
                      <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}><FaTrash /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'produtos':
        if (!isAdmin) return <p className="no-permission-message">Acesso negado. Apenas administradores.</p>;
        return (
          <div className="tab-content">
            <h2>Gestão de Produtos</h2>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchTermProducts}
                onChange={(e) => setSearchTermProducts(e.target.value)}
              />
            </div>
            <button className="add-btn" onClick={() => setIsCreatingProduct(true)}>
              <FaPlus /> Adicionar Novo Produto
            </button>

            {isCreatingProduct && (
              <div className="form-modal product-form">
                <h3>Criar Novo Produto</h3>
                <div className="form-group">
                  <label>Nome:</label>
                  <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Descrição:</label>
                  <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}></textarea>
                </div>
                <div className="form-group">
                  <label>Preço:</label>
                  <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label>URL da Imagem:</label>
                  <input type="text" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Categoria:</label>
                  <div style={{ display: 'flex', gap: '1rem' }}> {/* Adicione este estilo */}
                    <div>
                      <input
                        type="radio"
                        id="newProductCategoryRoupas"
                        name="newProductCategory"
                        value="Roupas"
                        checked={newProduct.category === 'Roupas'}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                      <label htmlFor="newProductCategoryRoupas">Roupas</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="newProductCategoryTenis"
                        name="newProductCategory"
                        value="Ténis"
                        checked={newProduct.category === 'Ténis'}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                      <label htmlFor="newProductCategoryTenis">Ténis</label>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>URL Sketchfab (Opcional):</label>
                  <input type="text" value={newProduct.sketchfabUrl} onChange={(e) => setNewProduct({ ...newProduct, sketchfabUrl: e.target.value })} />
                </div>
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="inStockNew"
                    checked={newProduct.inStock}
                    onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                  />
                  <label htmlFor="inStockNew">Em Stock</label>
                </div>
                <h4>Stock por Tamanho:</h4>
                <div className="stock-inputs-grid">
                  {Object.keys(newProduct.stock).map(size => (
                    <div key={size} className="stock-input-item">
                      <label>{size}:</label>
                      <input
                        type="number"
                        value={newProduct.stock[size]}
                        onChange={(e) =>
                          setNewProduct(prev => ({
                            ...prev,
                            stock: { ...prev.stock, [size]: parseInt(e.target.value) || 0 }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="actions">
                  <button className="save-btn" onClick={handleCreateProduct}>Criar Produto</button>
                  <button className="cancel-btn" onClick={() => setIsCreatingProduct(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {selectedProductToEdit && (
              <div className="form-modal product-form">
                <h3>Editar Produto: {selectedProductToEdit.name}</h3>
                <div className="form-group">
                  <label>Nome:</label>
                  <input type="text" value={editProductData.name} onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Descrição:</label>
                  <textarea value={editProductData.description} onChange={(e) => setEditProductData({ ...editProductData, description: e.target.value })}></textarea>
                </div>
                <div className="form-group">
                  <label>Preço:</label>
                  <input type="number" value={editProductData.price} onChange={(e) => setEditProductData({ ...editProductData, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label>URL da Imagem:</label>
                  <input type="text" value={editProductData.image} onChange={(e) => setEditProductData({ ...editProductData, image: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>URL Sketchfab (Opcional):</label>
                  <input type="text" value={editProductData.sketchfabUrl} onChange={(e) => setEditProductData({ ...editProductData, sketchfabUrl: e.target.value })} />
                </div>
               {editProductData.sketchfabUrl && (
  <div className="sketchfab-preview">
    <iframe
      title={editProductData.name}
      frameBorder="0"
      // Removendo allowFullScreen e mozallowfullscreen/webkitallowfullscreen se não quiser que o iframe possa ir para fullscreen,
      // embora o botão de UI_fullscreen=0 já o esconda. Para máxima segurança, pode remover estes atributos também.
      // allowFullScreen
      // mozallowfullscreen="true"
      // webkitallowfullscreen="true"
      allow="autoplay; xr-spatial-tracking" // Removido 'fullscreen' do allow
      xr-spatial-tracking
      execution-while-out-of-viewport
      execution-while-not-rendered
      web-share
      src={`${editProductData.sketchfabUrl}/embed?autostart=1&preload=1&ui_controls=0&ui_infos=0&ui_inspector=0&ui_settings=0&ui_help=0&ui_vr=0&ui_ar=0&ui_annotations=0&ui_watermark=0&transparent=0&background=FFFFFF&ui_fullscreen=0&ui_tools=0&share_button=0`}
    style={{ width: '100%', height: '333px' }} 
    ></iframe>
   
  </div>
)}
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="inStockEdit"
                    checked={editProductData.inStock}
                    onChange={(e) => setEditProductData({ ...editProductData, inStock: e.target.checked })}
                  />
                  <label htmlFor="inStockEdit">Em Stock</label>
                </div>
                <h4>Stock por Tamanho:</h4>
                <div className="stock-inputs-grid">
                  {Object.keys(editProductData.stock).map(size => (
                    <div key={size} className="stock-input-item">
                      <label>{size}:</label>
                      <input
                        type="number"
                        value={editProductData.stock[size]}
                        onChange={(e) =>
                          setEditProductData(prev => ({
                            ...prev,
                            stock: { ...prev.stock, [size]: parseInt(e.target.value) || 0 }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="actions">
                  <button className="save-btn" onClick={handleSaveEditedProduct}>Salvar Produto</button>
                  <button className="cancel-btn" onClick={() => setSelectedProductToEdit(null)}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="product-grid">
              {filteredProducts.length === 0 ? (
                <p className="no-items-message">Nenhum produto encontrado.</p>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="product-item">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p>€{product.price?.toFixed(2)}</p>
                      <p>Categoria: {product.category}</p>
                      <p>Stock: {product.inStock ? 'Disponível' : 'Esgotado'}</p>
                      <div className="stock-details">
                        {Object.keys(product.stock || {}).map(size => (
                          <span key={size}>{size}: {product.stock[size]}</span>
                        ))}
                      </div>
                    </div>
                    <div className="actions">
                      <button className="edit-btn" onClick={() => handleEditProduct(product)}><FaEdit /></button>
                      <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}><FaTrash /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'historico-compras-pessoal':
        return (
          <div className="tab-content orders-history-tab">
            <h2>Meu Histórico de Compras</h2>
            {userOrders.length === 0 ? (
              <p className="no-items-message">Você ainda não fez nenhum pedido.</p>
            ) : (
              <div className="orders-list">
                {userOrders.map(order => (
                  <div key={order.id} className="order-item">
                    <h3>Pedido ID: {order.id}</h3>
                    <p><strong>Data:</strong> {new Date(order.orderDate.toDate()).toLocaleString()}</p>
                    <p><strong>Total:</strong> €{order.totalAmount.toFixed(2)}</p>
                    <h4>Produtos:</h4>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index} className="order-product-item">
                          <img src={item.image} alt={item.name} className="order-product-image" />
                          <span>{item.name} ({item.size}) x {item.quantity} - €{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'historico-compras-utilizador':
        if (!isAdmin) return <p className="no-permission-message">Acesso negado. Apenas administradores.</p>;
        return (
          <div className="tab-content section all-orders-history-tab">
            <h2>Histórico de Compras de Todos os Utilizadores</h2>
            {allOrders.length === 0 ? (
              <p className="no-items-message">Nenhum pedido encontrado.</p>
            ) : (
              <div className="orders-list">
                {allOrders.map(order => (
                  <div key={order.id} className="order-item">
                    <h3>Pedido ID: {order.id}</h3>
                    <p><strong>Utilizador:</strong> {usersMap[order.userId] || order.userEmail || order.userId}</p>
                    <p><strong>Data:</strong> {new Date(order.orderDate.toDate()).toLocaleString()}</p>
                    <p><strong>Total:</strong> €{order.totalAmount.toFixed(2)}</p>
                    <h4>Produtos:</h4>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index} className="order-product-item">
                          <img src={item.image} alt={item.name} className="order-product-image" />
                          <span>{item.name} ({item.size}) x {item.quantity} - €{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="dashboard-container"> {/* Novo container principal */}
        <h1 className="account-title">Minha Conta</h1>

        <div className="dashboard-layout">
          <div className="sidebar">
            <button
              className={`tab-button ${activeTab === 'conta' ? 'active' : ''}`}
              onClick={() => setActiveTab('conta')}
            >
              <FaUser /> Minha Conta
            </button>
            {isAdmin && (
              <>
                <button
                  className={`tab-button ${activeTab === 'utilizadores' ? 'active' : ''}`}
                  onClick={() => setActiveTab('utilizadores')}
                >
                  <FaUsers /> Utilizadores
                </button>
                <button
                  className={`tab-button ${activeTab === 'produtos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('produtos')}
                >
                  <FaBox /> Produtos
                </button>
                <button
                  className={`tab-button ${activeTab === 'historico-compras-utilizador' ? 'active' : ''}`}
                  onClick={() => setActiveTab('historico-compras-utilizador')}
                >
                  <FaHistory /> Histórico de Todos os Pedidos
                </button>
              </>
            )}
            <button
              className={`tab-button ${activeTab === 'historico-compras-pessoal' ? 'active' : ''}`}
              onClick={() => setActiveTab('historico-compras-pessoal')}
            >
              <FaHistory /> Meu Histórico de Compras
            </button>
            <button
              className="tab-button logout-button"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <FaSignOutAlt /> Sair
            </button>
          </div>

          <div className="main-content">
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default Conta;