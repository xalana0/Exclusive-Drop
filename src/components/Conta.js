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
  updateDoc
} from 'firebase/firestore';
import '../styles/account.css';
import '../styles/add-product-inline.css'; // Make sure this file exists for product form styles

const Conta = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('conta'); // 'conta', 'utilizadores', 'produtos'

  // State for Account Tab
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // State for Users Tab (Admin)
  const [userList, setUserList] = useState([]);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', isAdmin: false });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', isAdmin: false });
  const [userManagementError, setUserManagementError] = useState(''); // Renamed for clarity
  const [userManagementSuccess, setUserManagementSuccess] = useState(''); // Renamed for clarity

  // State for Products Tab (Admin)
  const [productList, setProductList] = useState([]); // State to hold fetched products
  const [selectedProductToEdit, setSelectedProductToEdit] = useState(null); // State for product being edited
  // Adicionado sketchfabUrl ao estado de edição
  const [editProductData, setEditProductData] = useState({ name: '', price: '', description: '', image: '', sketchfabUrl: '', sizes: [{ size: '', stock: 0 }] });
  const [showAddProductForm, setShowAddProductForm] = useState(false); // State to show/hide add product form
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductImageURL, setNewProductImageURL] = useState('');
  // Novo estado para o URL do Sketchfab no formulário de adição
  const [newProductSketchfabUrl, setNewProductSketchfabUrl] = useState('');
  const [newProductSizes, setNewProductSizes] = useState([{ size: '', stock: 0 }]); // Sizes/stock for adding
  const [productManagementError, setProductManagementError] = useState(''); // Renamed for clarity
  const [productManagementSuccess, setProductManagementSuccess] = useState(''); // Renamed for clarity


  // --- Fetch Data Functions ---

  const fetchUserData = useCallback(async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setIsAdmin(data.isAdmin || false);
      } else {
        console.log('No such user document!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [db]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollection);
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
      setUserList(usersData);
      setUserManagementError(''); // Clear errors on successful fetch
    } catch (error) {
      console.error('Error fetching all users:', error);
      setUserManagementError('Erro ao buscar a lista de utilizadores.');
    }
  }, [db]);

  const fetchAllProducts = useCallback(async () => {
    try {
      const productsCollection = collection(db, 'products');
      const querySnapshot = await getDocs(productsCollection);
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
      setProductList(productsData);
      setProductManagementError(''); // Clear errors on successful fetch
    } catch (error) {
      console.error('Error fetching all products:', error);
      setProductManagementError('Erro ao buscar a lista de produtos.');
    }
  }, [db]);


  // --- Effects ---

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.id) {
      fetchUserData(session.user.id);
    }
  }, [status, router, session, fetchUserData]);

  useEffect(() => {
    if (isAdmin && activeTab === 'utilizadores') {
      fetchAllUsers();
    }
  }, [isAdmin, activeTab, fetchAllUsers]);

  useEffect(() => {
    if (isAdmin && activeTab === 'produtos') {
      fetchAllProducts();
    }
  }, [isAdmin, activeTab, fetchAllProducts]);


  // --- Navigation Handlers ---

  const handleLogout = async () => {
    await signOut({ redirect: '/login' });
  };

  const handleGoHome = () => {
    router.push('/home'); // Redireciona para a página principal (home)
  };

  const handleEditProfileToggle = () => {
    setIsEditingProfile(!isEditingProfile);
    if (!isEditingProfile && userData) {
      setEditName(userData.username);
      setEditEmail(userData.email);
    }
  };

  const handleSaveProfile = async () => {
    console.log('Saving profile:', { name: editName, email: editEmail });
    // IMPORTANT: Implement actual save logic to Firebase here.
    // Example:
    // if (session?.user?.id) {
    //   try {
    //     const userDocRef = doc(db, 'users', session.user.id);
    //     await updateDoc(userDocRef, { username: editName, email: editEmail });
    //     setSuccessMessage('Perfil atualizado com sucesso!'); // You'd need state for this message specifically for profile
    //     fetchUserData(session.user.id); // Re-fetch to show updated data
    //   } catch (error) {
    //     console.error('Error saving profile:', error);
    //     setErrorMessage('Erro ao salvar o perfil.'); // You'd need state for this message
    //   }
    // }
    setIsEditingProfile(false);
    // For now, just toggle editing off. Actual save needs Firebase update.
  };


  // --- Admin Tabs Navigation ---

  const handleManageUsersTab = () => {
    setActiveTab('utilizadores');
    // Reset other tab states
    setIsCreatingUser(false);
    setSelectedUserToEdit(null);
    setShowAddProductForm(false);
    setSelectedProductToEdit(null);
    setUserManagementError('');
    setUserManagementSuccess('');
    setProductManagementError(''); // Also clear product messages
    setProductManagementSuccess(''); // Also clear product messages
  };

  const handleManageProductsTab = () => {
    setActiveTab('produtos');
    // Reset other tab states
    setIsCreatingUser(false);
    setSelectedUserToEdit(null);
    setShowAddProductForm(false); // Ensure add form is initially hidden
    setSelectedProductToEdit(null); // Ensure edit product form is initially hidden
    setUserManagementError(''); // Also clear user messages
    setUserManagementSuccess(''); // Also clear user messages
    setProductManagementError('');
    setProductManagementSuccess('');
  };


  // --- User Management Handlers (Admin) ---

  const handleCreateUserToggle = () => {
    setIsCreatingUser(true);
    setSelectedUserToEdit(null);
    setShowAddProductForm(false);
    setSelectedProductToEdit(null);
    setNewUser({ username: '', email: '', password: '', isAdmin: false });
    setUserManagementError('');
    setUserManagementSuccess('');
  };

  const handleEditUserToggle = (userId) => {
    const userToEdit = userList.find(user => user.id === userId);
    if (userToEdit) {
      setSelectedUserToEdit(userId);
      setIsCreatingUser(false);
      setShowAddProductForm(false);
      setSelectedProductToEdit(null);
      // Incluir sketchfabUrl ao carregar dados para edição
      setEditUserData({ ...userToEdit.data, id: userToEdit.id });
      setUserManagementError('');
      setUserManagementSuccess('');
    }
  };

  const handleEditUserInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveEditedUser = async () => {
    if (!selectedUserToEdit) return;
    setUserManagementError('');
    setUserManagementSuccess('');
    try {
      const userDocRef = doc(db, 'users', selectedUserToEdit);
      // Use updateDoc or setDoc with merge for clarity on partial updates
      await updateDoc(userDocRef, {
        username: editUserData.username,
        email: editUserData.email,
        isAdmin: editUserData.isAdmin
      });
      setUserManagementSuccess('Utilizador atualizado com sucesso!');
      await fetchAllUsers(); // Refresh the list
      setSelectedUserToEdit(null); // Close the edit form
    } catch (error) {
      console.error('Error updating user:', error);
      setUserManagementError('Erro ao atualizar o utilizador.');
    }
  };

  const handleRemoveUser = async (userIdToRemove) => {
    if (window.confirm('Tem certeza que deseja remover este utilizador?')) {
      setUserManagementError('');
      setUserManagementSuccess('');
      try {
        await deleteDoc(doc(db, 'users', userIdToRemove));
        setUserManagementSuccess('Utilizador removido com sucesso!');
        await fetchAllUsers(); // Refresh the list
        if (selectedUserToEdit === userIdToRemove) {
           setSelectedUserToEdit(null); // Close edit form if the deleted user was being edited
        }
      } catch (error) {
        console.error('Error removing user:', error);
        setUserManagementError('Erro ao remover o utilizador.');
      }
    }
  };

  const handleNewUserInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateNewUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setUserManagementError('Por favor, preencha todos os campos.');
      setUserManagementSuccess('');
      return;
    }
    setUserManagementError('');
    setUserManagementSuccess('');
    try {
      // IMPORTANT: Em um ambiente de produção, você NUNCA deve salvar a senha diretamente.
      // Você precisa usar uma biblioteca de hash como bcrypt para armazenar hashes seguros das senhas.
      await addDoc(collection(db, 'users'), {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password, // AVISO: Inseguro em produção
        isAdmin: newUser.isAdmin || false,
      });
      setUserManagementSuccess('Utilizador criado com sucesso!');
      setNewUser({ username: '', email: '', password: '', isAdmin: false }); // Clear form
      await fetchAllUsers(); // Refresh the list
      setIsCreatingUser(false); // Hide create form
    } catch (error) {
      console.error('Error creating user:', error);
      setUserManagementError('Erro ao criar o utilizador.');
    }
  };

  // --- Add Product Handlers (Admin) ---

  const handleToggleAddProductForm = () => {
    setShowAddProductForm(!showAddProductForm);
    setSelectedProductToEdit(null); // Hide edit form if showing add form
    setProductManagementError('');
    setProductManagementSuccess('');
    // Clear add product form state
    setNewProductName('');
    setNewProductPrice('');
    setNewProductDescription('');
    setNewProductImageURL('');
    setNewProductSketchfabUrl(''); // Limpar o novo campo do Sketchfab
    setNewProductSizes([{ size: '', stock: 0 }]);
  };

  const handleAddProductSize = () => {
    setNewProductSizes([...newProductSizes, { size: '', stock: 0 }]);
  };

  const handleRemoveProductSize = (index) => {
    const newSizes = [...newProductSizes];
    newSizes.splice(index, 1);
    setNewProductSizes(newSizes);
  };

  const handleNewProductSizeChange = (index, event) => {
    const newSizes = [...newProductSizes];
    newSizes[index].size = event.target.value;
    setNewProductSizes(newSizes);
  };

  const handleNewProductStockChange = (index, event) => {
    const newSizes = [...newProductSizes];
    newSizes[index].stock = parseInt(event.target.value, 10) || 0;
    setNewProductSizes(newSizes);
  };

  // Handler para o novo campo do Sketchfab na adição
  const handleNewProductSketchfabUrlChange = (e) => {
    setNewProductSketchfabUrl(e.target.value);
  };


  const handleAddNewProduct = async (e) => {
    e.preventDefault();
    setProductManagementError('');
    setProductManagementSuccess('');

    if (!newProductName || !newProductPrice || !newProductDescription || !newProductImageURL || newProductSizes.some(s => !s.size)) {
      setProductManagementError('Por favor, preencha todos os campos obrigatórios (Nome, Preço, Descrição, URL da Imagem, e pelo menos um Tamanho).');
      return;
    }

    // Convert sizes array to stock object { size: stock }
    const stockObject = newProductSizes.reduce((acc, curr) => {
       if (curr.size) { // Only include if size is not empty
          acc[curr.size] = curr.stock;
       }
       return acc;
    }, {});

    const productData = {
      name: newProductName,
      price: parseFloat(newProductPrice),
      description: newProductDescription,
      image: newProductImageURL,
      sketchfabUrl: newProductSketchfabUrl || null, // Incluir o URL do Sketchfab (ou null se vazio)
      stock: stockObject, // Save as object
      createdAt: new Date(), // Optional: add timestamp
      updatedAt: new Date(), // Optional: add timestamp
    };

    try {
      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log('Produto adicionado com ID: ', docRef.id);
      setProductManagementSuccess('Produto adicionado com sucesso!');
      setShowAddProductForm(false); // Hide form
      // Clear form state
      setNewProductName('');
      setNewProductPrice('');
      setNewProductDescription('');
      setNewProductImageURL('');
      setNewProductSketchfabUrl(''); // Limpar o novo campo
      setNewProductSizes([{ size: '', stock: 0 }]);
      fetchAllProducts(); // Refresh the list
    } catch (error) {
      console.error('Erro ao adicionar produto: ', error);
      setProductManagementError('Erro ao adicionar o produto.');
    }
  };


  // --- Product Management Handlers (Admin) ---

  const handleEditProductToggle = (productId) => {
      const productToEdit = productList.find(product => product.id === productId);
      if (productToEdit) {
        setSelectedProductToEdit(productId);
        setShowAddProductForm(false); // Hide add form
        // Prepare data for the edit form, converting stock object to sizes array
        // Incluir sketchfabUrl ao carregar dados para edição
        setEditProductData({
          ...productToEdit.data,
          id: productToEdit.id,
          // Convert the stock object { 'EU 40': 5, 'EU 42': 10 } into an array [{ size: 'EU 40', stock: 5 }, ...]
          sizes: Object.entries(productToEdit.data.stock || {}).map(([size, stock]) => ({ size, stock: stock || 0 })),
          sketchfabUrl: productToEdit.data.sketchfabUrl || '' // Carregar o URL Sketchfab para edição
        });
        setProductManagementError('');
        setProductManagementSuccess('');
      }
  };

  const handleEditProductInputChange = (e) => {
    const { name, value, type } = e.target;
    setEditProductData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value, // Handle price as number
    }));
  };

  // Handlers for sizes/stock within the edit form
  const handleEditProductSizeChange = (index, event) => {
      setEditProductData(prev => {
          const newSizes = [...prev.sizes];
          newSizes[index].size = event.target.value;
          return { ...prev, sizes: newSizes };
      });
  };

  const handleEditProductStockChange = (index, event) => {
      setEditProductData(prev => {
          const newSizes = [...prev.sizes];
          newSizes[index].stock = parseInt(event.target.value, 10) || 0;
          return { ...prev, sizes: newSizes };
      });
  };

   const handleAddEditProductSize = () => {
      setEditProductData(prev => ({
        ...prev,
        sizes: [...prev.sizes, { size: '', stock: 0 }]
      }));
    };

    const handleRemoveEditProductSize = (index) => {
      setEditProductData(prev => {
        const newSizes = [...prev.sizes];
        newSizes.splice(index, 1);
        return { ...prev, sizes: newSizes };
      });
    };

    // Handler para o novo campo do Sketchfab na edição
    const handleEditProductSketchfabUrlChange = (e) => {
        setEditProductData(prev => ({
            ...prev,
            sketchfabUrl: e.target.value
        }));
    };


  const handleSaveEditedProduct = async () => {
    if (!selectedProductToEdit || !editProductData) return;

    setProductManagementError('');
    setProductManagementSuccess('');

    if (!editProductData.name || !editProductData.price || !editProductData.description || !editProductData.image || editProductData.sizes.some(s => !s.size)) {
         setProductManagementError('Por favor, preencha todos os campos obrigatórios (Nome, Preço, Descrição, URL da Imagem, e pelo menos um Tamanho).');
         return;
    }


    // Convert sizes array back to stock object { size: stock }
    const stockObject = editProductData.sizes.reduce((acc, curr) => {
       if (curr.size) { // Only include if size is not empty
          acc[curr.size] = curr.stock;
       }
       return acc;
    }, {});

    const updatedProductData = {
       name: editProductData.name,
       price: editProductData.price,
       description: editProductData.description,
       image: editProductData.image,
       sketchfabUrl: editProductData.sketchfabUrl || null, // Incluir o URL do Sketchfab (ou null se vazio)
       stock: stockObject, // Save back as object
       updatedAt: new Date(), // Optional: update timestamp
    };

    try {
      const productDocRef = doc(db, 'products', selectedProductToEdit);
      // Use updateDoc for partial updates, or setDoc with merge: true
      await updateDoc(productDocRef, updatedProductData);
      setProductManagementSuccess('Produto atualizado com sucesso!');
      await fetchAllProducts(); // Refresh the list
      setSelectedProductToEdit(null); // Close the edit form
    } catch (error) {
      console.error('Error updating product:', error);
      setProductManagementError('Erro ao atualizar o produto.');
    }
  };

  const handleRemoveProduct = async (productIdToRemove) => {
    if (window.confirm('Tem certeza que deseja remover este produto?')) {
      setProductManagementError('');
      setProductManagementSuccess('');
      try {
        await deleteDoc(doc(db, 'products', productIdToRemove));
        setProductManagementSuccess('Produto removido com sucesso!');
        await fetchAllProducts(); // Refresh the list
         if (selectedProductToEdit === productIdToRemove) {
            setSelectedProductToEdit(null); // Close edit form if the deleted product was being edited
         }
      } catch (error) {
        console.error('Error removing product:', error);
        setProductManagementError('Erro ao remover o produto.');
      }
    }
  };


  // --- Loading and Authentication States ---

  if (status === 'loading') {
    return <div className="account-container">A carregar dados da conta...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="account-container">Não autenticado. Redirecionando para o login...</div>;
  }

  // --- Render Component ---

  return (
    <div className="account-container">
      {/* Header-like bar container */}
      <div className="header-bar">
        {/* Welcome message */}
        <div className="welcome-message">
          Bem-vindo, {userData?.username || 'Utilizador'}!
        </div>

        {/* Navigation Tabs and Back Button */}
        <div className="header-actions"> {/* New container for tabs and back button */}
           {/* Tabs - Keeping the existing tabs div and buttons */}
           <div className="tabs">
             <button
               className={`${activeTab === 'conta' ? 'active' : ''} admin-btn`} // Added admin-btn
               onClick={() => setActiveTab('conta')}
             >
               Conta
             </button>
             {isAdmin && (
               <>
                 <button
                   className={`${activeTab === 'utilizadores' ? 'active' : ''} admin-btn`} // Added admin-btn
                   onClick={handleManageUsersTab}
                 >
                   Utilizadores
                 </button>
                 <button
                   className={`${activeTab === 'produtos' ? 'active' : ''} admin-btn`} // Added admin-btn
                   onClick={handleManageProductsTab}
                 >
                   Produtos
                 </button>
               </>
             )}
           </div>

           {/* Back to Home Button - Using admin-btn for consistent style */}
           <button className="admin-btn" onClick={handleGoHome}>
             Voltar para o Menu Principal
           </button>
        </div>
      </div>


      {/* --- Account Tab Content --- */}
      {activeTab === 'conta' && (
        <div className="account-card">
          <h2 className="card-title">Informações da Conta</h2>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Nome:</span>
              {isEditingProfile ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              ) : (
                <span className="info-value">{userData?.username}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              {isEditingProfile ? (
                <input
                  type="email"
                  className="edit-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              ) : (
                <span className="info-value">{userData?.email}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Password:</span>
              <span className="info-value">********</span> {/* Passwords should not be editable directly here */}
            </div>
            <div className="actions">
              {isEditingProfile ? (
                <>
                    <button className="save-btn" onClick={handleSaveProfile}>Salvar Perfil</button>
                    <button className="cancel-btn" onClick={handleEditProfileToggle}>Cancelar</button>
                </>
              ) : (
                <button className="edit-btn" onClick={handleEditProfileToggle}>Editar Perfil</button>
              )}
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* --- User Management Tab Content (Admin) --- */}
      {activeTab === 'utilizadores' && isAdmin && (
        <div className="admin-section">
          <h2 className="admin-title">Gerenciar Utilizadores</h2>
           {userManagementError && <p className="error-message">{userManagementError}</p>}
           {userManagementSuccess && <p className="success-message">{userManagementSuccess}</p>}

          <ul className="admin-options">
            <li className="admin-item">
              <button className="admin-btn" onClick={handleCreateUserToggle}>Criar Novo Utilizador</button>
            </li>
          </ul>

          <div className="manage-users-section">
            <h3 className="admin-subtitle">Lista de Utilizadores</h3>

            {userList.length === 0 && <p>Nenhum utilizador encontrado.</p>}

            {userList.map(user => (
              <div key={user.id} className="list-item"> {/* Using generic list-item class */}
                <span>{user.data.username} ({user.data.email}) {user.data.isAdmin && <strong>(Admin)</strong>}</span>
                <div className="actions"> {/* Group buttons for better alignment */}
                    <button className="edit-btn small" onClick={() => handleEditUserToggle(user.id)}>Editar</button>
                    {session?.user?.id !== user.id && ( // Prevent user from deleting themselves
                        <button className="remove-btn small" onClick={() => handleRemoveUser(user.id)}>Remover</button>
                    )}
                </div>
              </div>
            ))}

            {/* Edit User Form */}
            {selectedUserToEdit && (
              <div className="edit-form"> {/* Using generic edit-form class */}
                <h4 className="admin-subtitle">Editar Utilizador</h4>
                 {userManagementError && <p className="error-message">{userManagementError}</p>}
                 {userManagementSuccess && <p className="success-message">{userManagementSuccess}</p>}
                <div className="form-group">
                  <label>Username:</label>
                  <input type="text" name="username" value={editUserData.username} onChange={handleEditUserInputChange} />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" name="email" value={editUserData.email} onChange={handleEditUserInputChange} />
                </div>
                <div className="form-group">
                  <label>Admin:</label>
                  <input type="checkbox" name="isAdmin" checked={editUserData.isAdmin || false} onChange={handleEditUserInputChange} />
                </div>
                <div className="actions">
                   <button className="save-btn" onClick={handleSaveEditedUser}>Salvar Utilizador</button>
                   <button className="cancel-btn" onClick={() => setSelectedUserToEdit(null)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>

          {/* Create User Form */}
          {isCreatingUser && (
            <div className="create-form"> {/* Using generic create-form class */}
              <h3 className="admin-subtitle">Criar Novo Utilizador</h3>
               {userManagementError && <p className="error-message">{userManagementError}</p>}
               {userManagementSuccess && <p className="success-message">{userManagementSuccess}</p>}
              <div className="form-group">
                <label>Username:</label>
                <input type="text" name="username" value={newUser.username} onChange={handleNewUserInputChange} />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={newUser.email} onChange={handleNewUserInputChange} />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input type="password" name="password" value={newUser.password} onChange={handleNewUserInputChange} />
              </div>
              <div className="form-group">
                <label>Admin:</label>
                <input type="checkbox" name="isAdmin" checked={newUser.isAdmin || false} onChange={handleNewUserInputChange} />
              </div>
               <div className="actions">
                  <button className="create-btn" onClick={handleCreateNewUser}>Criar Utilizador</button>
                  <button className="cancel-btn" onClick={handleCreateUserToggle}>Cancelar</button>
               </div>
            </div>
          )}
        </div>
      )}

      {/* --- Product Management Tab Content (Admin) --- */}
      {activeTab === 'produtos' && isAdmin && (
        <div className="admin-section">
          <h2 className="admin-title">Gerenciar Produtos</h2>
          {productManagementError && <p className="error-message">{productManagementError}</p>}
          {productManagementSuccess && <p className="success-message">{productManagementSuccess}</p>}

          <ul className="admin-options">
             <li className="admin-item">
               <button className="admin-btn" onClick={handleToggleAddProductForm}>
                 {showAddProductForm ? 'Ocultar Formulário de Produto' : 'Adicionar Novo Produto'}
               </button>
             </li>
           </ul>

          {/* Add Product Form (Inline) */}
          {showAddProductForm && (
            <div className="add-product-inline-container">
              <h3 className="admin-subtitle">Adicionar Novo Produto</h3>
              {productManagementError && <p className="error-message">{productManagementError}</p>}
              {productManagementSuccess && <p className="success-message">{productManagementSuccess}</p>}
              <form onSubmit={handleAddNewProduct} className="add-product-inline-form">
                <div className="form-group">
                  <label htmlFor="newProductName">Nome:</label>
                  <input type="text" id="newProductName" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="newProductPrice">Preço:</label>
                  <input type="number" id="newProductPrice" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} step="0.01" required />
                </div>
                <div className="form-group">
                  <label htmlFor="newProductDescription">Descrição:</label>
                  <textarea id="newProductDescription" value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="newProductImageURL">URL da Imagem:</label>
                  <input type="url" id="newProductImageURL" value={newProductImageURL} onChange={(e) => setNewProductImageURL(e.target.value)} required />
                </div>

                {/* Novo campo para URL do Sketchfab */}
                <div className="form-group">
                  <label htmlFor="newProductSketchfabUrl">URL do Modelo 3D (Sketchfab):</label>
                  <input type="url" id="newProductSketchfabUrl" value={newProductSketchfabUrl} onChange={handleNewProductSketchfabUrlChange} />
                </div>

                {/* Sizes and Stock for Add Form */}
                <div className="form-group">
                  <label>Tamanhos e Stock:</label>
                  {newProductSizes.map((sizeObj, index) => (
                    <div key={index} className="size-stock-row">
                      <input
                        type="text"
                        placeholder="Tamanho (ex: EU 40)"
                        value={sizeObj.size}
                        onChange={(e) => handleNewProductSizeChange(index, e)}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={sizeObj.stock}
                        onChange={(e) => handleNewProductStockChange(index, e)}
                        required
                      />
                      {newProductSizes.length > 1 && (
                        <button type="button" className="remove-size-btn" onClick={() => handleRemoveProductSize(index)}>
                          Remover
                        </button>
                      )}
                    </div>
                  ))}
                    {/* Adicionar Tamanho button - Added admin-btn small */}
                  <button type="button" className="admin-btn small" onClick={handleAddProductSize}>
                    Adicionar Tamanho
                  </button>
                </div>

                <button type="submit" className="submit-btn"> {/* Using submit-btn class */}
                  Adicionar Produto
                </button>
                <button type="button" className="cancel-btn" onClick={handleToggleAddProductForm}>Cancelar</button> {/* Added cancel button */}
              </form>
            </div>
          )}

          {/* List Products Section */}
          <div className="manage-products-section"> {/* Using generic manage-section class */}
            <h3 className="admin-subtitle">Lista de Produtos</h3>
             {productManagementError && <p className="error-message">{productManagementError}</p>}
             {productManagementSuccess && <p className="success-message">{productManagementSuccess}</p>}

            {productList.length === 0 && <p>Nenhum produto encontrado.</p>}

            {productList.map(product => (
              <div key={product.id} className="list-item"> {/* Using generic list-item class */}
                <span>{product.data.name} - €{product.data.price?.toFixed(2)}</span> {/* Added optional chaining for price */}
                <div className="actions"> {/* Group buttons for better alignment */}
                    <button className="edit-btn small" onClick={() => handleEditProductToggle(product.id)}>Editar</button>
                    <button className="remove-btn small" onClick={() => handleRemoveProduct(product.id)}>Remover</button>
                </div>
              </div>
            ))}

            {/* Edit Product Form */}
             {selectedProductToEdit && editProductData && ( // Ensure editProductData is loaded
                <div className="edit-form"> {/* Using generic edit-form class */}
                   <h4 className="admin-subtitle">Editar Produto</h4>
                   {productManagementError && <p className="error-message">{productManagementError}</p>}
                   {productManagementSuccess && <p className="success-message">{productManagementSuccess}</p>}
                   <div className="form-group">
                      <label htmlFor="editProductName">Nome:</label>
                      <input type="text" id="editProductName" name="name" value={editProductData.name} onChange={handleEditProductInputChange} required />
                   </div>
                   <div className="form-group">
                      <label htmlFor="editProductPrice">Preço:</label>
                      <input type="number" id="editProductPrice" name="price" value={editProductData.price} onChange={handleEditProductInputChange} step="0.01" required />
                   </div>
                   <div className="form-group">
                      <label htmlFor="editProductDescription">Descrição:</label>
                      <textarea id="editProductDescription" name="description" value={editProductData.description} onChange={handleEditProductInputChange} required />
                   </div>
                   <div className="form-group">
                      <label htmlFor="editProductImageURL">URL da Imagem:</label>
                      <input type="url" id="editProductImageURL" name="image" value={editProductData.image} onChange={handleEditProductInputChange} required />
                   </div>

                   {/* Novo campo para URL do Sketchfab na edição */}
                   <div className="form-group">
                      <label htmlFor="editProductSketchfabUrl">URL do Modelo 3D (Sketchfab):</label>
                      <input type="url" id="editProductSketchfabUrl" name="sketchfabUrl" value={editProductData.sketchfabUrl} onChange={handleEditProductSketchfabUrlChange} />
                   </div>

                   {/* Sizes and Stock for Edit Form */}
                   <div className="form-group">
                     <label>Tamanhos e Stock:</label>
                     {editProductData.sizes.map((sizeObj, index) => (
                       <div key={index} className="size-stock-row"> {/* Reusing size-stock-row class */}
                         <input
                           type="text"
                           placeholder="Tamanho (ex: EU 40)"
                           value={sizeObj.size}
                           onChange={(e) => handleEditProductSizeChange(index, e)}
                           required
                         />
                         <input
                           type="number"
                           placeholder="Stock"
                           value={sizeObj.stock}
                           onChange={(e) => handleEditProductStockChange(index, e)}
                           required
                         />
                         {editProductData.sizes.length > 1 && (
                           <button type="button" className="remove-size-btn" onClick={() => handleRemoveEditProductSize(index)}>
                             Remover
                           </button>
                         )}
                       </div>
                     ))}
                       {/* Adicionar Tamanho button - Added admin-btn small */}
                     <button type="button" className="admin-btn small" onClick={handleAddEditProductSize}>
                       Adicionar Tamanho
                     </button>
                   </div>

                   <div className="actions">
                      <button className="save-btn" onClick={handleSaveEditedProduct}>Salvar Produto</button>
                      <button className="cancel-btn" onClick={() => setSelectedProductToEdit(null)}>Cancelar</button>
                   </div>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Conta;
