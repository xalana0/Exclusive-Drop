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
import { FaUser, FaUsers, FaBox, FaHistory, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const SIZES_BY_CATEGORY = {
  Roupas: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Ténis: ['38', '39', '40', '41', '42', '43', '44', '45'],
};

const getDefaultStockForCategory = (category) => {
  const sizes = SIZES_BY_CATEGORY[category] || [];
  return sizes.reduce((acc, size) => {
    acc[size] = 0;
    return acc;
  }, {});
};

// Função para validar se um URL é de uma imagem
const isImageURL = (url) => {
    if (!url) return false;
    // Validação simples de extensão
    if (!/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url)) {
        return false;
    }
    // Tenta carregar a imagem para confirmar que é válida
    return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
    });
};


const Conta = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState(router.query.tab || 'conta');
  const [loading, setLoading] = useState(true);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [userList, setUserList] = useState([]);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', isAdmin: false });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', isAdmin: false });
  const [searchTermUsers, setSearchTermUsers] = useState('');
  const [filteredUserList, setFilteredUserList] = useState([]);

  const [products, setProducts] = useState([]);
  const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);
  const [editProductData, setEditProductData] = useState({ name: '', description: '', price: 0, images: [''], category: '', inStock: true, stock: {}, sketchfabUrl: '' });
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, images: [''], category: '', inStock: true, stock: {}, sketchfabUrl: '' });
  const [searchTermProducts, setSearchTermProducts] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [userOrders, setUserOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [usersMap, setUsersMap] = useState({});

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
          setFormMessage({ type: 'error', text: "Erro: Dados do utilizador não encontrados." });
        }
      } catch (error) {
        setFormMessage({ type: 'error', text: "Erro ao carregar os dados do utilizador." });
      }
    }
  }, [session]);

  const fetchUserList = useCallback(async () => {
    try {
      const usersCol = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCol);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserList(usersData);
    } catch (error) {
      setFormMessage({ type: 'error', text: "Erro ao carregar a lista de utilizadores." });
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const productsCol = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCol);
      const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (error) {
        setFormMessage({ type: 'error', text: "Erro ao carregar os produtos." });
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const ordersCol = collection(db, 'orders');
      const userOrdersQuery = query(ordersCol, where('userId', '==', session.user.id), orderBy('orderDate', 'desc'));
      const userOrdersSnapshot = await getDocs(userOrdersQuery);
      setUserOrders(userOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      if (isAdmin) {
        const allOrdersQuery = query(ordersCol, orderBy('orderDate', 'desc'));
        const allOrdersSnapshot = await getDocs(allOrdersQuery);
        const allOrdersData = allOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllOrders(allOrdersData);

        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersMapData = {};
        usersSnapshot.docs.forEach(userDoc => {
          usersMapData[userDoc.id] = userDoc.data().username || userDoc.data().email || 'Desconhecido';
        });
        setUsersMap(usersMapData);
      }
    } catch (error) {
        setFormMessage({ type: 'error', text: "Erro ao carregar os pedidos." });
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
      setFormMessage({ type: '', text: '' });
      await fetchUserData();
      setLoading(false);
    };

    loadAllData();

    if (activeTab === 'utilizadores' && isAdmin) fetchUserList();
    else if (activeTab === 'produtos' && isAdmin) fetchProducts();
    else if (activeTab === 'historico-compras-pessoal' || (activeTab === 'historico-compras-utilizador' && isAdmin)) fetchOrders();
  }, [session, status, router, fetchUserData, fetchUserList, fetchProducts, fetchOrders, isAdmin, activeTab]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setFormMessage({ type: '', text: '' });
  };

  const handleSaveProfile = async () => {
    setFormMessage({ type: '', text: '' });
    if (!userData?.id) return;
    if (!editName || !editEmail) {
      setFormMessage({ type: 'error', text: "O nome de utilizador e o email não podem estar vazios." });
      return;
    }

    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editName, email: editEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setUserData(prev => ({ ...prev, username: editName, email: editEmail }));
      setIsEditingProfile(false);
      setFormMessage({ type: 'success', text: 'Perfil guardado com sucesso!' });
    } catch (error) {
      setFormMessage({ type: 'error', text: error.message || "Erro ao guardar o perfil." });
    }
  };

  const handleChangePassword = async () => {
    setFormMessage({ type: '', text: '' });
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setFormMessage({ type: 'error', text: 'Por favor, preencha todos os campos da palavra-passe.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setFormMessage({ type: 'error', text: 'As novas palavras-passe não correspondem.' });
      return;
    }
    if (newPassword.length < 6) {
      setFormMessage({ type: 'error', text: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' });
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setFormMessage({ type: 'success', text: 'Palavra-passe alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setFormMessage({ type: 'error', text: error.message || 'Erro ao alterar a palavra-passe.' });
    }
  };

  useEffect(() => {
    const lowercasedSearchTerm = searchTermUsers.toLowerCase();
    const filtered = userList.filter(user =>
      user.id !== session?.user?.id &&
      ((user.username && user.username.toLowerCase().includes(lowercasedSearchTerm)) ||
      (user.email && user.email.toLowerCase().includes(lowercasedSearchTerm)))
    );
    setFilteredUserList(filtered);
  }, [searchTermUsers, userList, session?.user?.id]);

  const handleEditUser = (user) => {
    setSelectedUserToEdit(user);
    setEditUserData({ username: user.username, email: user.email, isAdmin: user.isAdmin });
    setFormMessage({ type: '', text: '' });
  };

  const handleSaveEditedUser = async () => {
    if (!selectedUserToEdit?.id) return;
    if (!editUserData.username || !editUserData.email) {
      setFormMessage({ type: 'error', text: 'O nome de utilizador e o email não podem estar vazios.' });
      return;
    }
    try {
      await updateDoc(doc(db, 'users', selectedUserToEdit.id), {
        username: editUserData.username,
        email: editUserData.email,
        isAdmin: editUserData.isAdmin,
      });
      setFormMessage({ type: 'success', text: 'Utilizador atualizado com sucesso!' });
      setSelectedUserToEdit(null);
      fetchUserList();
    } catch (error) {
      setFormMessage({ type: 'error', text: 'Erro ao guardar o utilizador.' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem a certeza que deseja apagar este utilizador?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setFormMessage({ type: 'success', text: 'Utilizador apagado com sucesso!' });
        fetchUserList();
      } catch (error) {
        setFormMessage({ type: 'error', text: 'Erro ao apagar o utilizador.' });
      }
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setFormMessage({ type: 'error', text: 'Por favor, preencha todos os campos para criar um novo utilizador.' });
      return;
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, telemovel: 'N/A' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setFormMessage({ type: 'success', text: 'Utilizador criado com sucesso!' });
      setIsCreatingUser(false);
      setNewUser({ username: '', email: '', password: '', isAdmin: false });
      fetchUserList();
    } catch (error) {
      setFormMessage({ type: 'error', text: error.message || 'Erro ao criar o utilizador.' });
    }
  };
  
  const handleCreateProduct = async () => {
    setFormMessage({type: '', text: ''});
    if (!newProduct.name || newProduct.price === undefined || !newProduct.images[0] || !newProduct.category) {
        setFormMessage({type: 'error', text: 'Por favor, preencha os campos obrigatórios: Nome, Preço, Imagem Principal e Categoria.'});
        return;
    }

    const isValidImage = await isImageURL(newProduct.images[0]);
    if (!isValidImage) {
        setFormMessage({type: 'error', text: 'O URL da imagem principal não é válido.'});
        return;
    }

    const totalStock = Object.values(newProduct.stock).reduce((sum, qty) => sum + qty, 0);
    if (totalStock === 0) {
        setFormMessage({type: 'error', text: 'Não é possível criar um produto sem stock. Adicione pelo menos uma unidade.'});
        return;
    }
    
    try {
      await addDoc(collection(db, 'products'), { ...newProduct, inStock: totalStock > 0, createdAt: new Date() });
      setFormMessage({type: 'success', text: 'Produto criado com sucesso!'});
      setIsCreatingProduct(false);
      setNewProduct({ name: '', description: '', price: 0, images: [''], category: '', inStock: true, stock: {}, sketchfabUrl: '' });
      fetchProducts();
    } catch (error) {
      setFormMessage({type: 'error', text: 'Erro ao criar o produto.'});
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProductToEdit(product);
    const defaultStock = getDefaultStockForCategory(product.category);
    const currentStock = { ...defaultStock, ...(product.stock || {}) };
    setEditProductData({ ...product, stock: currentStock, images: product.images || [''] });
    setFormMessage({type: '', text: ''});
  };

  const handleSaveEditedProduct = async () => {
    setFormMessage({type: '', text: ''});
    if (!selectedProductToEdit?.id) return;
    
    if (!editProductData.name || editProductData.price === undefined || !editProductData.images[0]) {
        setFormMessage({type: 'error', text: 'Nome, preço e imagem principal são campos obrigatórios.'});
        return;
    }

    const isValidImage = await isImageURL(editProductData.images[0]);
    if (!isValidImage) {
        setFormMessage({type: 'error', text: 'O URL da imagem principal não é válido.'});
        return;
    }

    const totalStock = Object.values(editProductData.stock).reduce((sum, qty) => sum + qty, 0);
    if (totalStock === 0) {
        setFormMessage({type: 'error', text: 'Não é possível guardar um produto sem stock. Adicione pelo menos uma unidade.'});
        return;
    }

    try {
      const productDocRef = doc(db, 'products', selectedProductToEdit.id);
      await updateDoc(productDocRef, { ...editProductData, inStock: totalStock > 0 });
      setFormMessage({type: 'success', text: 'Produto atualizado com sucesso!'});
      setSelectedProductToEdit(null);
      fetchProducts();
    } catch (error) {
      setFormMessage({type: 'error', text: 'Erro ao guardar as alterações do produto.'});
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem a certeza que deseja apagar este produto?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setFormMessage({ type: 'success', text: 'Produto apagado com sucesso!' });
        fetchProducts();
      } catch (error) {
        setFormMessage({ type: 'error', text: 'Erro ao apagar o produto.' });
      }
    }
  };
  
  const handleImageChange = (index, value, productStateSetter) => {
    productStateSetter(prev => {
        const newImages = [...prev.images];
        newImages[index] = value;
        return { ...prev, images: newImages };
    });
  };

  const addImageField = (productStateSetter) => {
    productStateSetter(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index, productStateSetter) => {
    productStateSetter(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };


  useEffect(() => {
    const lowercasedSearchTerm = searchTermProducts.toLowerCase();
    const filtered = products.filter(product =>
      (product.name && product.name.toLowerCase().includes(lowercasedSearchTerm)) ||
      (product.category && product.category.toLowerCase().includes(lowercasedSearchTerm)) ||
      (product.description && product.description.toLowerCase().includes(lowercasedSearchTerm))
    );
    setFilteredProducts(filtered);
  }, [searchTermProducts, products]);

  if (status === 'loading' || loading) return <div className="account-container" style={{ textAlign: 'center', padding: '50px', color: 'white' }}><h2>A carregar...</h2></div>;
  if (!session) return null;
  
  const renderContent = () => {
    switch (activeTab) {
      case 'conta':
        return (
          <div className="tab-content profile-section">
            <h2>A Minha Conta</h2>
            {formMessage.text && <p className={formMessage.type === 'error' ? 'error-message' : 'success-message'} style={{textAlign: 'center', marginBottom: '1rem'}}>{formMessage.text}</p>}
            
            {isEditingProfile ? (
              <div className="edit-profile-form">
                <div className="form-group">
                  <label>Nome de Utilizador:</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
                <div className="actions">
                  <button className="save-btn" onClick={handleSaveProfile}>Guardar Alterações</button>
                  <button className="cancel-btn" onClick={() => { setIsEditingProfile(false); setFormMessage({type: '', text: ''}); }}>Cancelar</button>
                </div>
                <hr style={{ margin: '2rem 0', borderColor: 'rgba(255,255,255,0.2)' }} />
                <h3>Mudar Palavra-passe</h3>
                <div className="form-group">
                  <label>Palavra-passe Atual:</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Nova Palavra-passe:</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Confirmar Nova Palavra-passe:</label>
                  <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                </div>
                <div className="actions">
                  <button className="edit-btn" onClick={handleChangePassword}>Mudar Palavra-passe</button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <p><strong>Nome de Utilizador:</strong> {userData?.username || 'N/A'}</p>
                <p><strong>Email:</strong> {userData?.email || 'N/A'}</p>
                <p><strong>Tipo de Conta:</strong> {isAdmin ? 'Administrador' : 'Utilizador'}</p>
                <div className="actions">
                  <button className="edit-btn" onClick={handleEditProfile}>Editar Perfil</button>
                </div>
              </div>
            )}
          </div>
        );
      case 'utilizadores':
        if (!isAdmin) return <p className="no-permission-message">Acesso negado. Apenas para administradores.</p>;
        return (
          <div className="tab-content">
            <h2>Gestão de Utilizadores</h2>
            {formMessage.text && <p className={formMessage.type === 'error' ? 'error-message' : 'success-message'} style={{textAlign: 'center', marginBottom: '1rem'}}>{formMessage.text}</p>}
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Pesquisar utilizadores..." value={searchTermUsers} onChange={(e) => setSearchTermUsers(e.target.value)} />
            </div>
            <button className="add-btn" onClick={() => setIsCreatingUser(true)}>
              <FaPlus /> Adicionar Novo Utilizador
            </button>

            {isCreatingUser && (
              <div className="form-modal">
                <h3>Criar Novo Utilizador</h3>
                <div className="form-group">
                  <label>Nome de Utilizador:</label>
                  <input type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Palavra-Passe:</label>
                  <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" id="isAdminNew" checked={newUser.isAdmin} onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })} />
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
                  <input type="text" value={editUserData.username} onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" value={editUserData.email} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} />
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" id="isAdminEdit" checked={editUserData.isAdmin} onChange={(e) => setEditUserData({ ...editUserData, isAdmin: e.target.checked })} />
                  <label htmlFor="isAdminEdit">Administrador</label>
                </div>
                <div className="actions">
                  <button className="save-btn" onClick={handleSaveEditedUser}>Guardar</button>
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
        if (!isAdmin) return <p className="no-permission-message">Acesso negado. Apenas para administradores.</p>;
        return (
          <div className="tab-content">
            <h2>Gestão de Produtos</h2>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Pesquisar produtos..." value={searchTermProducts} onChange={(e) => setSearchTermProducts(e.target.value)} />
            </div>
            <button className="add-btn" onClick={() => {setIsCreatingProduct(true); setFormMessage({ type: '', text: '' });}}>
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
                    {newProduct.images.map((url, index) => (
                        <div key={index} className="form-group image-url-group">
                            <label>URL da Imagem {index + 1}:</label>
                            <div className="image-url-input">
                                <input type="text" value={url} onChange={(e) => handleImageChange(index, e.target.value, setNewProduct)} />
                                {index > 0 && <button onClick={() => removeImageField(index, setNewProduct)} className="remove-image-btn">-</button>}
                            </div>
                        </div>
                    ))}
                    <button onClick={() => addImageField(setNewProduct)} className="add-image-btn">+ Adicionar outra imagem</button>
                    <div className="form-group">
                      <label>Categoria:</label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div>
                          <input type="radio" id="newProductCategoryRoupas" name="newProductCategory" value="Roupas" checked={newProduct.category === 'Roupas'} onChange={(e) => { const category = e.target.value; setNewProduct({ ...newProduct, category, stock: getDefaultStockForCategory(category) }); }} />
                          <label htmlFor="newProductCategoryRoupas">Roupas</label>
                        </div>
                        <div>
                          <input type="radio" id="newProductCategoryTenis" name="newProductCategory" value="Ténis" checked={newProduct.category === 'Ténis'} onChange={(e) => { const category = e.target.value; setNewProduct({ ...newProduct, category, stock: getDefaultStockForCategory(category) }); }} />
                          <label htmlFor="newProductCategoryTenis">Ténis</label>
                        </div>
                      </div>
                    </div>
                    {newProduct.category && (
                      <>
                        <h4>Stock por Tamanho:</h4>
                        <div className="stock-inputs-grid">
                          {Object.keys(newProduct.stock).map(size => (
                            <div key={size} className="stock-input-item">
                              <label>{size}:</label>
                              <input type="number" min="0" value={newProduct.stock[size]} onChange={(e) => setNewProduct(prev => ({ ...prev, stock: { ...prev.stock, [size]: parseInt(e.target.value) || 0 } }))} />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="form-group">
                      <label>URL Sketchfab (Opcional):</label>
                      <input type="text" value={newProduct.sketchfabUrl} onChange={(e) => setNewProduct({ ...newProduct, sketchfabUrl: e.target.value })} />
                    </div>
                    {formMessage.text && <p className={formMessage.type === 'error' ? 'error-message' : 'success-message'} style={{textAlign: 'center', marginTop: '1rem'}}>{formMessage.text}</p>}
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
                    {editProductData.images.map((url, index) => (
                        <div key={index} className="form-group image-url-group">
                            <label>URL da Imagem {index + 1}:</label>
                            <div className="image-url-input">
                                <input type="text" value={url} onChange={(e) => handleImageChange(index, e.target.value, setEditProductData)} />
                                {index > 0 && <button onClick={() => removeImageField(index, setEditProductData)} className="remove-image-btn">-</button>}
                            </div>
                        </div>
                    ))}
                    <button onClick={() => addImageField(setEditProductData)} className="add-image-btn">+ Adicionar outra imagem</button>
                    <div className="form-group">
                        <label>URL Sketchfab (Opcional):</label>
                        <input type="text" value={editProductData.sketchfabUrl} onChange={(e) => setEditProductData({ ...editProductData, sketchfabUrl: e.target.value })} />
                    </div>
                    <h4>Stock por Tamanho:</h4>
                    <div className="stock-inputs-grid">
                        {Object.keys(editProductData.stock).map(size => (
                            <div key={size} className="stock-input-item">
                                <label>{size}:</label>
                                <input type="number" min="0" value={editProductData.stock[size]} onChange={(e) => setEditProductData(prev => ({...prev, stock: { ...prev.stock, [size]: parseInt(e.target.value) || 0 }}))} />
                            </div>
                        ))}
                    </div>
                    {formMessage.text && <p className={formMessage.type === 'error' ? 'error-message' : 'success-message'} style={{textAlign: 'center', marginTop: '1rem'}}>{formMessage.text}</p>}
                    <div className="actions">
                      <button className="save-btn" onClick={handleSaveEditedProduct}>Guardar Alterações</button>
                      <button className="cancel-btn" onClick={() => setSelectedProductToEdit(null)}>Cancelar</button>
                    </div>
                </div>
            )}
            <div className="product-grid">
              {filteredProducts.length === 0 ? (
                <p className="no-items-message">Nenhum produto encontrado.</p>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="product-item">
                    <img src={product.images && product.images[0] ? product.images[0] : '/placeholder.svg'} alt={product.name} className="product-image" />
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
            <h2>O Meu Histórico de Compras</h2>
            {userOrders.length === 0 ? (
              <p className="no-items-message">Ainda não efetuou nenhum pedido.</p>
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
                          <img src={item.image} alt={item.name} className="order-product-image"/>
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
        if (!isAdmin) return <p className="no-permission-message">Acesso negado. Apenas para administradores.</p>;
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
                          <img src={item.image} alt={item.name} className="order-product-image"/>
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
      <div className="dashboard-container">
        <h1 className="account-title">Área de Cliente</h1>
        <div className="dashboard-layout">
          <div className="sidebar">
            <button className={`tab-button ${activeTab === 'conta' ? 'active' : ''}`} onClick={() => setActiveTab('conta')}>
              <FaUser /> A Minha Conta
            </button>
            {isAdmin && (
              <>
                <button className={`tab-button ${activeTab === 'utilizadores' ? 'active' : ''}`} onClick={() => setActiveTab('utilizadores')}>
                  <FaUsers /> Gerir Utilizadores
                </button>
                <button className={`tab-button ${activeTab === 'produtos' ? 'active' : ''}`} onClick={() => setActiveTab('produtos')}>
                  <FaBox /> Gerir Produtos
                </button>
                <button className={`tab-button ${activeTab === 'historico-compras-utilizador' ? 'active' : ''}`} onClick={() => setActiveTab('historico-compras-utilizador')}>
                  <FaHistory /> Todos os Pedidos
                </button>
              </>
            )}
            <button className={`tab-button ${activeTab === 'historico-compras-pessoal' ? 'active' : ''}`} onClick={() => setActiveTab('historico-compras-pessoal')}>
              <FaHistory /> As Minhas Compras
            </button>
            <button className="tab-button logout-button" onClick={() => signOut({ callbackUrl: '/' })}>
              <FaSignOutAlt /> Sair
            </button>
            <button className="tab-button logout-button-back-button-purple" onClick={() => router.back()}>
              Voltar
            </button>
          </div>
          <div className="main-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default Conta;
