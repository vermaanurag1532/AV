import React, { useState, useEffect } from 'react';
import { 
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Card
} from '@nextui-org/react';
import { getDishes, createDish, updateDish, deleteDish } from '../utils/api';
import EnhancedDishForm from '../components/DishForm';
import DishCard from '../components/DishCard';
import styles from '../styles/DishPage.module.css';

function Dishes() {
  const [isOpen, setIsOpen] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingDish, setEditingDish] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    fetchDishes();
    
    // Add background animation
    const root = document.documentElement;
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      root.style.setProperty('--mouse-x', x.toString());
      root.style.setProperty('--mouse-y', y.toString());
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const fetchDishes = async () => {
    setLoading(true);
    try {
      const dishesData = await getDishes();
      setDishes(dishesData);
      
      // Extract unique categories
      const typeSet = new Set();
      dishesData.forEach(dish => {
        if (dish['Type of Dish'] && Array.isArray(dish['Type of Dish'])) {
          dish['Type of Dish'].forEach(type => {
            if (type !== 'Veg' && type !== 'Non-Veg') {
              typeSet.add(type);
            }
          });
        }
      });
      
      setCategories(Array.from(typeSet));
    } catch (error) {
      console.error('Error fetching dishes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Open/close modal handlers
  const onOpen = () => setIsOpen(true);
  const onClose = () => {
    setIsOpen(false);
    setEditingDish(null);
  };
  
  // Handle creating new dish
  const handleCreateDish = async (dishData) => {
    try {
      await createDish(dishData);
      onClose();
      fetchDishes();
    } catch (error) {
      console.error('Error creating dish:', error);
    }
  };
  
  // Handle updating dish
  const handleUpdateDish = async (dishData) => {
    try {
      await updateDish(editingDish['Dish Id'], dishData);
      setEditingDish(null);
      onClose();
      fetchDishes();
    } catch (error) {
      console.error('Error updating dish:', error);
    }
  };
  
  // Handle deleting dish with loading state
  const handleDeleteDish = async (dishId) => {
    try {
      setDeleting(true);
      setDeletingId(dishId);
      await deleteDish(dishId);
      fetchDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };
  
  // Open edit modal
  const openEditModal = (dish) => {
    setEditingDish(dish);
    onOpen();
  };
  
  // Open new dish modal
  const openNewDishModal = () => {
    setEditingDish(null);
    onOpen();
  };
  
  // Filter and search dishes
  const getFilteredDishes = () => {
    return dishes.filter(dish => {
      // Filter based on availability
      if (filter === 'available' && !dish.Available) {
        return false;
      }
      if (filter === 'unavailable' && dish.Available) {
        return false;
      }
      
      // Filter based on type
      if (filter === 'veg' && !dish['Type of Dish'].includes('Veg')) {
        return false;
      }
      if (filter === 'non-veg' && !dish['Type of Dish'].includes('Non-Veg')) {
        return false;
      }
      
      // Filter by category
      if (filter !== 'all' && filter !== 'available' && filter !== 'unavailable' 
          && filter !== 'veg' && filter !== 'non-veg') {
        if (!dish['Type of Dish'].includes(filter)) {
          return false;
        }
      }
      
      // Search term
      if (searchTerm && !dish.Name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };
  
  // Group dishes by category for better display
  const getCategoryDishes = () => {
    if (filter !== 'all') {
      return { 'All Dishes': getFilteredDishes() };
    }
    
    const categorizedDishes = {};
    const otherDishes = [];
    
    // First try to categorize by main course, appetizer, etc.
    getFilteredDishes().forEach(dish => {
      let isCategorized = false;
      
      if (dish['Type of Dish'] && Array.isArray(dish['Type of Dish'])) {
        for (const type of ['Main Course', 'Appetizer', 'Dessert', 'Beverage']) {
          if (dish['Type of Dish'].includes(type)) {
            if (!categorizedDishes[type]) categorizedDishes[type] = [];
            categorizedDishes[type].push(dish);
            isCategorized = true;
            break;
          }
        }
      }
      
      if (!isCategorized) {
        otherDishes.push(dish);
      }
    });
    
    if (otherDishes.length > 0) {
      categorizedDishes['Other Items'] = otherDishes;
    }
    
    return categorizedDishes;
  };
  
  // Handle skeleton rendering
  const renderSkeletons = () => {
    return Array(6).fill().map((_, index) => (
      <Card key={index} className="w-full h-64 p-4">
        <div className={styles.skeleton} style={{ height: '24px', width: '70%' }}></div>
        <div className={styles.skeleton} style={{ height: '16px', width: '40%', marginTop: '8px' }}></div>
        <div className={styles.skeleton} style={{ height: '16px', width: '100%', marginTop: '16px' }}></div>
        <div className={styles.skeleton} style={{ height: '16px', width: '100%', marginTop: '8px' }}></div>
        <div className={styles.skeleton} style={{ height: '16px', width: '80%', marginTop: '8px' }}></div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <div className={styles.skeleton} style={{ height: '24px', width: '30%', borderRadius: '9999px' }}></div>
          <div className={styles.skeleton} style={{ height: '24px', width: '30%', borderRadius: '9999px' }}></div>
        </div>
      </Card>
    ));
  };
  
  const categorizedDishes = getCategoryDishes();
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundPattern}></div>
      
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Menu Management</h1>
        <p className="text-gray-500 mb-6">Add, edit and manage your restaurant menu items</p>
      </div>
      
      <div className={styles.filterContainer}>
        <Input
          placeholder="Search dishes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          isClearable
          onClear={() => setSearchTerm('')}
          startContent={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          }
        />
        
        <Dropdown className={styles.filterDropdown}>
          <DropdownTrigger>
            <Button 
              variant="flat" 
              endContent={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              }
            >
              {filter === 'all' ? 'All Dishes' : 
               filter === 'available' ? 'Available Only' :
               filter === 'unavailable' ? 'Unavailable Only' :
               filter === 'veg' ? 'Vegetarian Only' :
               filter === 'non-veg' ? 'Non-Vegetarian Only' :
               filter}
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Filter Options"
            selectionMode="single"
            selectedKeys={[filter]}
            onSelectionChange={(keys) => setFilter(Array.from(keys)[0])}
          >
            <DropdownItem key="all">All Dishes</DropdownItem>
            <DropdownItem key="available">Available Only</DropdownItem>
            <DropdownItem key="unavailable">Unavailable Only</DropdownItem>
            <DropdownItem key="veg">Vegetarian Only</DropdownItem>
            <DropdownItem key="non-veg">Non-Vegetarian Only</DropdownItem>
            {categories.map(category => (
              <DropdownItem key={category}>{category}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        
        <Button 
          color="primary" 
          onPress={openNewDishModal}
          className={styles.addButton}
          endContent={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        >
          Add New Dish
        </Button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {renderSkeletons()}
        </div>
      ) : getFilteredDishes().length > 0 ? (
        Object.keys(categorizedDishes).map((category, categoryIndex) => (
          <div key={category} className={styles.menuSection} style={{ animationDelay: `${0.3 + (categoryIndex * 0.1)}s` }}>
            {Object.keys(categorizedDishes).length > 1 && (
              <h2 className={styles.menuSectionTitle}>{category}</h2>
            )}
            
            <div className={styles.dishesGrid}>
              {categorizedDishes[category].map((dish, index) => (
                <DishCard 
                  key={dish['Dish Id']} 
                  dish={dish} 
                  index={index}
                  onEdit={openEditModal}
                  onDelete={handleDeleteDish}
                  isDeleting={deleting}
                  deletingId={deletingId}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className={styles.emptyDish}>
          <div className={styles.emptyDishIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25-2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className={styles.emptyDishText}>No dishes found matching your criteria</p>
          <Button 
            color="primary" 
            onPress={() => {
              setSearchTerm('');
              setFilter('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
      
      <EnhancedDishForm 
        isOpen={isOpen} 
        onClose={onClose}
        onSubmit={editingDish ? handleUpdateDish : handleCreateDish}
        initialData={editingDish}
      />
    </div>
  );
}

export default Dishes;