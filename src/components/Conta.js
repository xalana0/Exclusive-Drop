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
  orderBy
} from 'firebase/firestore';

import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'; // Removido FaTimes
// Removido: import ProductCard from '@/components/product-card'; // Removido se não for mais usado



const Conta = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState(router.query.tab || 'conta');

  // State for Account Tab
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // State for Users Tab (Admin)
  const [userList, setUserList] = useState([]);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', isAdmin: false });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ username: '', email: '', password: '', isAdmin: false });
  const [userSearchTerm, setUserSearchTerm] = useState(''); // New state for user search

  // State for Products Tab (Admin)
  const [productData, setProductData] = useState([]); // Products fetched from Firebase
  const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: {},
    sku: '',
    sketchfabUrl: '',
  });
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: { S: 0, M: 0, L: 0, XL: 0 },
    sku: '',
    sketchfabUrl: '',
  });
  const [productSearchTerm, setProductSearchTerm] = useState(''); // New state for product search


  // State for Purchase History Tab
  const [userOrders, setUserOrders] = useState([]);

  // State for All Orders History Tab (Admin)
  const [allOrders, setAllOrders] = useState([]);
  const [usersMap, setUsersMap] = useState({}); // To map user IDs to names/emails

  // State for Addresses Tab
  const [activeAddress, setActiveAddress] = useState(null); // Para editar
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: '',
    isDefault: false
  });

  // Removido: State for Wishlist Tab
  // const [wishlistProducts, setWishlistProducts] = useState([]);

  // Global product list for product management (still needed for product management)
  const [allProducts, setAllProducts] = useState([]);


  // Fetch All Products (still needed for product management)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const productsCollectionRef = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollectionRef);
        const productsData = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllProducts(productsData);
      } catch (error) {
        console.error("Erro ao buscar todos os produtos:", error);
      }
    };

    fetchAllProducts();
  }, []); // Run once on component mount


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
        }
      } catch (error) {
        console.error("Erro ao buscar dados do utilizador:", error);
      }
    }
  }, [session?.user?.id]);

  const fetchUsers = useCallback(async () => {
    if (isAdmin) {
      try {
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserList(usersData);

        const usersMapData = {};
        usersData.forEach(user => {
          usersMapData[user.id] = user.username || user.email;
        });
        setUsersMap(usersMapData);

      } catch (error) {
        console.error("Erro ao buscar lista de utilizadores:", error);
      }
    }
  }, [isAdmin]);

  const fetchProducts = useCallback(async () => {
    if (isAdmin) {
      try {
        const productsCollectionRef = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollectionRef);
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProductData(productsData);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    }
  }, [isAdmin]);

  const fetchUserOrders = useCallback(async () => {
    if (session?.user?.id) {
      try {
        const ordersCollectionRef = collection(db, 'orders');
        const q = query(ordersCollectionRef, where('userId', '==', session.user.id), orderBy('orderDate', 'desc'));
        const orderSnapshot = await getDocs(q);
        const ordersData = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserOrders(ordersData);
      } catch (error) {
        console.error("Erro ao buscar pedidos do utilizador:", error);
      }
    }
  }, [session?.user?.id]);

  const fetchAllOrders = useCallback(async () => {
    if (isAdmin) {
      try {
        const ordersCollectionRef = collection(db, 'orders');
        const q = query(ordersCollectionRef, orderBy('orderDate', 'desc'));
        const orderSnapshot = await getDocs(q);
        const ordersData = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllOrders(ordersData);
      } catch (error) {
        console.error("Erro ao buscar todos os pedidos:", error);
      }
    }
  }, [isAdmin]);


  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    } else {
      fetchUserData();
    }
  }, [status, router, fetchUserData]);

  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchUserOrders();
    fetchAllOrders();
  }, [isAdmin, fetchUsers, fetchProducts, fetchUserOrders, fetchAllOrders]);


  // Removido: Update wishlistProducts whenever userData or allProducts changes
  // useEffect(() => { ... }, [userData, allProducts]);


  // Handlers for Account Tab
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    try {
      const userDocRef = doc(db, 'users', session.user.id);
      await updateDoc(userDocRef, {
        username: editName,
        email: editEmail,
      });
      setUserData(prev => ({ ...prev, username: editName, email: editEmail }));
      setIsEditingProfile(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert('Erro ao atualizar perfil.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage('As novas senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    // No ambiente real, aqui você chamaria uma função de autenticação do Firebase para atualizar a senha.
    // Para este projeto escolar, vamos apenas simular ou ignorar a atualização real da senha
    // devido a questões de segurança e complexidade.
    setPasswordMessage('Alteração de senha simulada com sucesso (requer integração com Firebase Auth em produção)!');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Handlers for Users Tab (Admin)
  const handleEditUser = (user) => {
    setSelectedUserToEdit(user);
    setEditUserData({ username: user.username, email: user.email, isAdmin: user.isAdmin });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;
    try {
      const userDocRef = doc(db, 'users', selectedUserToEdit.id);
      await updateDoc(userDocRef, editUserData);
      setSelectedUserToEdit(null);
      setEditUserData({ username: '', email: '', isAdmin: false });
      fetchUsers(); // Refresh the user list
      alert('Utilizador atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar utilizador:", error);
      alert('Erro ao atualizar utilizador.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que quer eliminar este utilizador?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        fetchUsers(); // Refresh the user list
        alert('Utilizador eliminado com sucesso!');
      } catch (error) {
        console.error("Erro ao eliminar utilizador:", error);
        alert('Erro ao eliminar utilizador.');
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Em um ambiente real, você usaria o Firebase Auth para criar o utilizador com email/senha
      // e depois guardaria os dados no Firestore. Para este projeto, apenas guardamos no Firestore.
      await addDoc(collection(db, 'users'), {
        username: newUserForm.username,
        email: newUserForm.email,
        password: newUserForm.password, // Em produção, a senha deve ser hashada no backend
        isAdmin: newUserForm.isAdmin,
      });
      setIsCreatingUser(false);
      setNewUserForm({ username: '', email: '', password: '', isAdmin: false });
      fetchUsers(); // Refresh the user list
      alert('Utilizador criado com sucesso!');
    } catch (error) {
      console.error("Erro ao criar utilizador:", error);
      alert('Erro ao criar utilizador.');
    }
  };

  // Handlers for Products Tab (Admin)
  const handleEditProduct = (product) => {
    setSelectedProductToEdit(product);
    setEditProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock || {}, // Ensure stock is an object
      sku: product.sku || '',
      sketchfabUrl: product.sketchfabUrl || '',
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProductToEdit) return;
    try {
      const productDocRef = doc(db, 'products', selectedProductToEdit.id);
      await updateDoc(productDocRef, editProductForm);
      setSelectedProductToEdit(null);
      setEditProductForm({ name: '', description: '', price: '', category: '', image: '', stock: {}, sku: '', sketchfabUrl: '' });
      fetchProducts(); // Refresh the product list
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      alert('Erro ao atualizar produto.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que quer eliminar este produto?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        fetchProducts(); // Refresh the product list
        alert('Produto eliminado com sucesso!');
      } catch (error) {
        console.error("Erro ao eliminar produto:", error);
        alert('Erro ao eliminar produto.');
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), newProductForm);
      setIsCreatingProduct(false);
      setNewProductForm({ name: '', description: '', price: '', category: '', image: '', stock: { S: 0, M: 0, L: 0, XL: 0 }, sku: '', sketchfabUrl: '' });
      fetchProducts(); // Refresh the product list
      alert('Produto criado com sucesso!');
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      alert('Erro ao criar produto.');
    }
  };

  // Handlers for Addresses Tab
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    try {
      const userRef = doc(db, 'users', session.user.id);
      const currentAddresses = userData.addresses || [];
      
      let updatedAddresses = [...currentAddresses, addressForm];
      // If the new address is set as default, ensure only it is default
      if (addressForm.isDefault) {
          updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
          updatedAddresses[updatedAddresses.length - 1].isDefault = true;
      }

      await updateDoc(userRef, {
        addresses: updatedAddresses
      });
      setUserData(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));
      setAddressForm({ street: '', city: '', postalCode: '', country: '', isDefault: false });
      setIsAddingAddress(false);
      alert('Endereço adicionado com sucesso!');
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error);
      alert('Erro ao adicionar endereço.');
    }
  };

  const handleEditAddress = (address, index) => {
    setActiveAddress(index);
    setAddressForm(address);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    if (!session?.user?.id || activeAddress === null) return;
    try {
      const userRef = doc(db, 'users', session.user.id);
      const updatedAddresses = [...userData.addresses];
      updatedAddresses[activeAddress] = addressForm;

      // If this address is set as default, clear default from others
      if (addressForm.isDefault) {
          updatedAddresses.forEach((addr, i) => {
              if (i !== activeAddress) addr.isDefault = false;
          });
      }

      await updateDoc(userRef, { addresses: updatedAddresses });
      setUserData(prev => ({ ...prev, addresses: updatedAddresses }));
      setActiveAddress(null);
      setAddressForm({ street: '', city: '', postalCode: '', country: '', isDefault: false });
      alert('Endereço atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar endereço:", error);
      alert('Erro ao atualizar endereço.');
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!session?.user?.id || !window.confirm('Tem certeza que quer eliminar este endereço?')) return;
    try {
      const userRef = doc(db, 'users', session.user.id);
      const filteredAddresses = userData.addresses.filter((_, i) => i !== index);
      await updateDoc(userRef, { addresses: filteredAddresses });
      setUserData(prev => ({ ...prev, addresses: filteredAddresses }));
      alert('Endereço eliminado com sucesso!');
    } catch (error) {
      console.error("Erro ao eliminar endereço:", error);
      alert('Erro ao eliminar endereço.');
    }
  };

  const handleSetDefaultAddress = async (index) => {
      if (!session?.user?.id) return;
      try {
          const userRef = doc(db, 'users', session.user.id);
          const updatedAddresses = userData.addresses.map((addr, i) => ({
              ...addr,
              isDefault: i === index // Define este como padrão, os outros como não padrão
          }));
          await updateDoc(userRef, { addresses: updatedAddresses });
          setUserData(prev => ({ ...prev, addresses: updatedAddresses }));
          alert('Endereço padrão atualizado!');
      } catch (error) {
          console.error("Erro ao definir endereço padrão:", error);
          alert('Erro ao definir endereço padrão.');
      }
  };

  // Removido: Handlers for Wishlist Tab
  // const handleRemoveFromWishlist = async (productId) => { ... };


  const filteredUsers = userList.filter(user =>
    user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredProductsList = productData.filter(product =>
    product.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(productSearchTerm.toLowerCase())
  );


  if (status === 'loading' || !userData) {
    return <div className="loading-container">A Carregar...</div>;
  }

  return (
    <>
      <div className="account-container">
        <h1 className="account-title">A Minha Conta</h1>

        <div className="account-tabs">
          <button
            className={`tab-button ${activeTab === 'conta' ? 'active' : ''}`}
            onClick={() => setActiveTab('conta')}
          >
            A Minha Conta
          </button>
          <button
            className={`tab-button ${activeTab === 'historico' ? 'active' : ''}`}
            onClick={() => setActiveTab('historico')}
          >
            Histórico de Compras
          </button>
          <button
            className={`tab-button ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            Endereços
          </button>
          {/* Removido: Botão da Lista de Desejos */}
          {/* <button
            className={`tab-button ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            Lista de Desejos
          </button> */}

          {isAdmin && (
            <>
              <button
                className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Gerir Utilizadores
              </button>
              <button
                className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                Gerir Produtos
              </button>
              <button
                className={`tab-button ${activeTab === 'all-orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('all-orders')}
              >
                Todos os Pedidos
              </button>
            </>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="logout-button"
          >
            Sair
          </button>
        </div>

        <div className="account-content">
          {/* A Minha Conta Tab */}
          {activeTab === 'conta' && (
            <div className="tab-content-section profile-tab">
              <h2>Detalhes da Conta</h2>
              {!isEditingProfile ? (
                <div className="profile-info">
                  <p><strong>Username:</strong> <span>{userData.username}</span></p>
                  <p><strong>Email:</strong> <span>{userData.email}</span></p>
                  {userData.telemovel && <p><strong>Telemóvel:</strong> <span>{userData.telemovel}</span></p>}
                  <div className="profile-actions">
                    <button className="edit-btn" onClick={() => setIsEditingProfile(true)}>
                      <FaEdit /> Editar Perfil
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="profile-edit-form">
                  <div className="input-group">
                    <label>Username:</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="save-btn">
                      Guardar Alterações
                    </button>
                    <button type="button" className="cancel-btn" onClick={() => setIsEditingProfile(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <h2 style={{marginTop: '3rem'}}>Alterar Password</h2>
              <form onSubmit={handleChangePassword} className="password-change-form">
                <div className="input-group">
                  <label>Nova Password:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Confirmar Nova Password:</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
                {passwordMessage && <p className="error-message">{passwordMessage}</p>}
                <div className="form-buttons">
                  <button type="submit" className="save-btn">
                    Alterar Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Histórico de Compras Tab (User) */}
          {activeTab === 'historico' && (
            <div className="tab-content-section purchase-history-tab">
              <h2>O Seu Histórico de Compras</h2>
              {userOrders.length === 0 ? (
                <p className="no-items-message">Não tem nenhum pedido no seu histórico.</p>
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
          )}

          {/* Endereços Tab */}
          {activeTab === 'addresses' && (
              <div className="tab-content-section addresses-tab">
                  <h2>Os Seus Endereços</h2>
                  <button className="create-btn" onClick={() => { setIsAddingAddress(true); setActiveAddress(null); setAddressForm({ street: '', city: '', postalCode: '', country: '', isDefault: false }); }}>
                      <FaPlus /> Adicionar Novo Endereço
                  </button>

                  {isAddingAddress || activeAddress !== null ? (
                      <form onSubmit={activeAddress !== null ? handleUpdateAddress : handleAddAddress} className="address-form">
                          <div className="input-group">
                              <label>Rua:</label>
                              <input type="text" name="street" value={addressForm.street} onChange={handleAddressFormChange} required />
                          </div>
                          <div className="input-group">
                              <label>Cidade:</label>
                              <input type="text" name="city" value={addressForm.city} onChange={handleAddressFormChange} required />
                          </div>
                          <div className="input-group">
                              <label>Código Postal:</label>
                              <input type="text" name="postalCode" value={addressForm.postalCode} onChange={handleAddressFormChange} required />
                          </div>
                          <div className="input-group">
                              <label>País:</label>
                              <input type="text" name="country" value={addressForm.country} onChange={handleAddressFormChange} required />
                          </div>
                          <div className="input-group checkbox-group">
                              <input type="checkbox" id="isDefaultAddress" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressFormChange} />
                              <label htmlFor="isDefaultAddress">Definir como Endereço Padrão</label>
                          </div>
                          <div className="form-buttons">
                              <button type="submit" className="save-btn">{activeAddress !== null ? 'Atualizar Endereço' : 'Guardar Endereço'}</button>
                              <button type="button" className="cancel-btn" onClick={() => { setIsAddingAddress(false); setActiveAddress(null); setAddressForm({ street: '', city: '', postalCode: '', country: '', isDefault: false }); }}>
                                  Cancelar
                              </button>
                          </div>
                      </form>
                  ) : (
                      <div className="addresses-list">
                          {userData?.addresses && userData.addresses.length > 0 ? (
                              userData.addresses.map((address, index) => (
                                  <div key={index} className="address-item">
                                      <p><strong>Rua:</strong> {address.street}</p>
                                      <p><strong>Cidade:</strong> {address.city}</p>
                                      <p><strong>Código Postal:</strong> {address.postalCode}</p>
                                      <p><strong>País:</strong> {address.country}</p>
                                      {address.isDefault && <p className="default-address-tag">Endereço Padrão</p>}
                                      <div className="address-actions">
                                          <button className="edit-btn" onClick={() => handleEditAddress(address, index)}><FaEdit /> Editar</button>
                                          <button className="delete-btn" onClick={() => handleDeleteAddress(index)}><FaTrash /> Eliminar</button>
                                          {!address.isDefault && (
                                              <button className="save-btn" onClick={() => handleSetDefaultAddress(index)}>Definir como Padrão</button>
                                          )}
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <p className="no-items-message">Nenhum endereço guardado. Adicione um novo!</p>
                          )}
                      </div>
                  )}
              </div>
          )}

          {/* Removido: Lista de Desejos Tab */}
          {/* {activeTab === 'wishlist' && ( ... )} */}


          {/* Gerir Utilizadores Tab (Admin Only) */}
          {isAdmin && activeTab === 'users' && (
            <div className="tab-content-section user-management-tab">
              <div className="section-header-with-search">
                  <h2>Gerir Utilizadores</h2>
                  <div className="search-input-group">
                      <FaSearch className="search-icon" />
                      <input
                          type="text"
                          placeholder="Pesquisar utilizador por nome ou email..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="search-input"
                      />
                  </div>
              </div>

              <button className="create-btn" onClick={() => { setIsCreatingUser(true); setSelectedUserToEdit(null); setNewUserForm({ username: '', email: '', password: '', isAdmin: false }); }}>
                <FaPlus /> Criar Novo Utilizador
              </button>

              {isCreatingUser ? (
                <form onSubmit={handleCreateUser} className="user-form-container">
                  <h3>Criar Novo Utilizador</h3>
                  <div className="input-group">
                    <label>Username:</label>
                    <input type="text" value={newUserForm.username} onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>Email:</label>
                    <input type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>Password:</label>
                    <input type="password" value={newUserForm.password} onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })} required />
                  </div>
                  <div className="input-group checkbox-group">
                    <input type="checkbox" id="newUserAdmin" checked={newUserForm.isAdmin} onChange={(e) => setNewUserForm({ ...newUserForm, isAdmin: e.target.checked })} />
                    <label htmlFor="newUserAdmin">É Admin?</label>
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="save-btn">Guardar</button>
                    <button type="button" className="cancel-btn" onClick={() => setIsCreatingUser(false)}>Cancelar</button>
                  </div>
                </form>
              ) : selectedUserToEdit ? (
                <form onSubmit={handleUpdateUser} className="user-form-container">
                  <h3>Editar Utilizador</h3>
                  <div className="input-group">
                    <label>Username:</label>
                    <input type="text" value={editUserData.username} onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>Email:</label>
                    <input type="email" value={editUserData.email} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} required />
                  </div>
                  <div className="input-group checkbox-group">
                    <input type="checkbox" id="isAdmin" checked={editUserData.isAdmin} onChange={(e) => setEditUserData({ ...editUserData, isAdmin: e.target.checked })} />
                    <label htmlFor="isAdmin">É Admin?</label>
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="save-btn">Atualizar</button>
                    <button type="button" className="cancel-btn" onClick={() => setSelectedUserToEdit(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="user-list">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="user-item">
                        <p><strong>ID:</strong> {user.id}</p>
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Admin:</strong> {user.isAdmin ? 'Sim' : 'Não'}</p>
                        <div className="actions">
                          <button className="edit-btn" onClick={() => handleEditUser(user)}><FaEdit /> Editar</button>
                          <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}><FaTrash /> Eliminar</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-items-message">Nenhum utilizador encontrado.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Gerir Produtos Tab (Admin Only) */}
          {isAdmin && activeTab === 'products' && (
            <div className="tab-content-section product-management-tab">
              <div className="section-header-with-search">
                  <h2>Gerir Produtos</h2>
                  <div className="search-input-group">
                      <FaSearch className="search-icon" />
                      <input
                          type="text"
                          placeholder="Pesquisar produto por nome, categoria ou SKU..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="search-input"
                      />
                  </div>
              </div>

              <button className="create-btn" onClick={() => { setIsCreatingProduct(true); setSelectedProductToEdit(null); setNewProductForm({ name: '', description: '', price: '', category: '', image: '', stock: { S: 0, M: 0, L: 0, XL: 0 }, sku: '', sketchfabUrl: '' }); }}>
                <FaPlus /> Criar Novo Produto
              </button>

              {isCreatingProduct ? (
                <form onSubmit={handleCreateProduct} className="product-form">
                  <h3>Criar Novo Produto</h3>
                  <div className="input-group">
                    <label>Nome:</label>
                    <input type="text" value={newProductForm.name} onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>Descrição:</label>
                    <textarea value={newProductForm.description} onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })} required></textarea>
                  </div>
                  <div className="input-group">
                    <label>Preço:</label>
                    <input type="number" step="0.01" value={newProductForm.price} onChange={(e) => setNewProductForm({ ...newProductForm, price: parseFloat(e.target.value) })} required />
                  </div>
                  <div className="input-group">
                    <label>Categoria:</label>
                    <input type="text" value={newProductForm.category} onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>URL Imagem:</label>
                    <input type="url" value={newProductForm.image} onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>SKU:</label>
                    <input type="text" value={newProductForm.sku} onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>URL Sketchfab (3D Model):</label>
                    <input type="url" value={newProductForm.sketchfabUrl} onChange={(e) => setNewProductForm({ ...newProductForm, sketchfabUrl: e.target.value })} />
                  </div>
                  {/* Stock por Tamanho */}
                  <div className="input-group">
                      <label>Stock por Tamanho:</label>
                      {['S', 'M', 'L', 'XL'].map(size => (
                          <div key={size} style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px'}}>
                              <label style={{minWidth: '30px'}}>{size}:</label>
                              <input
                                  type="number"
                                  value={newProductForm.stock[size] || 0}
                                  onChange={(e) => setNewProductForm(prev => ({
                                      ...prev,
                                      stock: { ...prev.stock, [size]: parseInt(e.target.value) || 0 }
                                  }))}
                                  style={{width: '80px'}}
                              />
                          </div>
                      ))}
                  </div>
                  <div className="actions">
                    <button type="submit" className="save-btn">Guardar</button>
                    <button type="button" className="cancel-btn" onClick={() => setIsCreatingProduct(false)}>Cancelar</button>
                  </div>
                </form>
              ) : selectedProductToEdit ? (
                <form onSubmit={handleUpdateProduct} className="product-form">
                  <h3>Editar Produto</h3>
                  <div className="input-group">
                    <label>Nome:</label>
                    <input type="text" value={editProductForm.name} onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>Descrição:</label>
                    <textarea value={editProductForm.description} onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })} required></textarea>
                  </div>
                  <div className="input-group">
                    <label>Preço:</label>
                    <input type="number" step="0.01" value={editProductForm.price} onChange={(e) => setEditProductForm({ ...editProductForm, price: parseFloat(e.target.value) })} required />
                  </div>
                  <div className="input-group">
                    <label>Categoria:</label>
                    <input type="text" value={editProductForm.category} onChange={(e) => setEditProductForm({ ...editProductForm, category: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>URL Imagem:</label>
                    <input type="url" value={editProductForm.image} onChange={(e) => setEditProductForm({ ...editProductForm, image: e.target.value })} required />
                  </div>
                   <div className="input-group">
                    <label>SKU:</label>
                    <input type="text" value={editProductForm.sku} onChange={(e) => setEditProductForm({ ...editProductForm, sku: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>URL Sketchfab (3D Model):</label>
                    <input type="url" value={editProductForm.sketchfabUrl} onChange={(e) => setEditProductForm({ ...editProductForm, sketchfabUrl: e.target.value })} />
                  </div>
                  {/* Stock por Tamanho para Edição */}
                  <div className="input-group">
                      <label>Stock por Tamanho:</label>
                      {['S', 'M', 'L', 'XL'].map(size => (
                          <div key={size} style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px'}}>
                              <label style={{minWidth: '30px'}}>{size}:</label>
                              <input
                                  type="number"
                                  value={editProductForm.stock[size] || 0}
                                  onChange={(e) => setEditProductForm(prev => ({
                                      ...prev,
                                      stock: { ...prev.stock, [size]: parseInt(e.target.value) || 0 }
                                  }))}
                                  style={{width: '80px'}}
                              />
                          </div>
                      ))}
                  </div>
                  <div className="actions">
                    <button type="submit" className="save-btn">Atualizar</button>
                    <button type="button" className="cancel-btn" onClick={() => setSelectedProductToEdit(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="product-list">
                  {filteredProductsList.length > 0 ? (
                    filteredProductsList.map((product) => (
                      <div key={product.id} className="product-item">
                        <img src={product.image} alt={product.name} className="product-item-image" />
                        <div>
                          <p><strong>Nome:</strong> {product.name}</p>
                          <p><strong>Preço:</strong> €{product.price.toFixed(2)}</p>
                          <p><strong>Categoria:</strong> {product.category}</p>
                          <p><strong>SKU:</strong> {product.sku || 'N/A'}</p>
                          <p><strong>Stock Total:</strong> {Object.values(product.stock || {}).reduce((acc, curr) => acc + curr, 0)}</p>
                        </div>
                        <div className="actions">
                          <button className="edit-btn" onClick={() => handleEditProduct(product)}><FaEdit /> Editar</button>
                          <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}><FaTrash /> Eliminar</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-items-message">Nenhum produto encontrado.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Todos os Pedidos Tab (Admin Only) */}
          {isAdmin && activeTab === 'all-orders' && (
            <div className="tab-content-section all-orders-history-tab">
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
          )}
        </div>
      </div>
    </>
  );
};

export default Conta;
