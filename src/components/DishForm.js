import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Textarea, 
  Checkbox, 
  Switch,
  Progress
} from '@nextui-org/react';
import styles from '../styles/DishForm.module.css';

function EnhancedDishForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState(
    initialData || {
      Name: '',
      Price: '',
      Discription: '',
      Rating: 0,
      'Cooking Time': '',
      Images: [],
      'Type of Dish': [],
      'Genre of Taste': [],
      Available: true
    }
  );
  
  const [dishTypes, setDishTypes] = useState(
    initialData ? initialData['Type of Dish'] : []
  );
  
  const [tasteGenres, setTasteGenres] = useState(
    initialData ? initialData['Genre of Taste'] : []
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formCompletion, setFormCompletion] = useState(0);
  
  // Recalculate form completion percentage
  useEffect(() => {
    let fieldsCompleted = 0;
    const requiredFields = ['Name', 'Price'];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (formData[field]) fieldsCompleted++;
    });
    
    // Check other fields
    if (formData.Discription) fieldsCompleted++;
    if (formData['Cooking Time']) fieldsCompleted++;
    if (dishTypes.length > 0) fieldsCompleted++;
    if (tasteGenres.length > 0) fieldsCompleted++;
    
    // Calculate percentage
    const totalFields = requiredFields.length + 4; // Required + other fields
    const percentage = Math.floor((fieldsCompleted / totalFields) * 100);
    
    setFormCompletion(percentage);
  }, [formData, dishTypes, tasteGenres]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };
  
  // Handle number input change
  const handleNumberChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };
  
  // Handle dish type checkboxes
  const handleDishTypeChange = (type) => {
    let updatedTypes = [...dishTypes];
    if (updatedTypes.includes(type)) {
      updatedTypes = updatedTypes.filter(t => t !== type);
    } else {
      updatedTypes.push(type);
    }
    
    setDishTypes(updatedTypes);
    setFormData({
      ...formData,
      'Type of Dish': updatedTypes
    });
  };
  
  // Handle taste genre checkboxes
  const handleTasteGenreChange = (genre) => {
    let updatedGenres = [...tasteGenres];
    if (updatedGenres.includes(genre)) {
      updatedGenres = updatedGenres.filter(g => g !== genre);
    } else {
      updatedGenres.push(genre);
    }
    
    setTasteGenres(updatedGenres);
    setFormData({
      ...formData,
      'Genre of Taste': updatedGenres
    });
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!formData.Name.trim()) {
      errors.Name = "Dish name is required";
    }
    
    if (!formData.Price) {
      errors.Price = "Price is required";
    } else if (isNaN(formData.Price) || Number(formData.Price) <= 0) {
      errors.Price = "Price must be a positive number";
    }
    
    if (formData.Rating && (isNaN(formData.Rating) || formData.Rating < 0 || formData.Rating > 5)) {
      errors.Rating = "Rating must be between 0 and 5";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        Price: parseInt(formData.Price),
        Rating: parseFloat(formData.Rating) || 0
      };
      
      await onSubmit(submissionData);
      
      // Reset form after successful submission
      if (!initialData) {
        setFormData({
          Name: '',
          Price: '',
          Discription: '',
          Rating: 0,
          'Cooking Time': '',
          Images: [],
          'Type of Dish': [],
          'Genre of Taste': [],
          Available: true
        });
        setDishTypes([]);
        setTasteGenres([]);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl"
      classNames={{
        base: styles.formModal,
        header: styles.modalHeader,
        body: styles.modalBody,
        footer: styles.modalFooter
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className={styles.formTitle}>
              <div>
                {initialData ? 'Edit Dish' : 'Add New Dish'}
                <div className={styles.formSubtitle}>
                  {initialData ? 'Update dish information' : 'Create a new dish for your menu'}
                </div>
              </div>
              <div className={styles.formCompletionContainer}>
                <Progress 
                  size="sm" 
                  radius="sm" 
                  value={formCompletion} 
                  color={formCompletion < 50 ? "warning" : formCompletion < 100 ? "primary" : "success"}
                  className={styles.formCompletion}
                  showValueLabel={true}
                />
              </div>
            </ModalHeader>
            
            <ModalBody>
              <div className={styles.formContainer}>
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Basic Information</h3>
                  
                  <div className={styles.formRow}>
                    <Input
                      name="Name"
                      value={formData.Name}
                      onChange={handleChange}
                      placeholder="Enter dish name"
                      variant="bordered"
                      isRequired
                      isInvalid={!!validationErrors.Name}
                      errorMessage={validationErrors.Name}
                      className={styles.formInput}
                    />
                    
                    <Input
                      name="Price"
                      type="number"
                      value={formData.Price}
                      onChange={handleChange}
                      placeholder="Enter price"
                      variant="bordered"
                      isRequired
                      isInvalid={!!validationErrors.Price}
                      errorMessage={validationErrors.Price}
                      className={styles.formInput}

                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <Input
                      name="Cooking Time"
                      value={formData['Cooking Time']}
                      onChange={handleChange}
                      placeholder="e.g., 25 mins"
                      variant="bordered"
                      className={styles.formInput}
                    />
                    
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      name="Rating"
                      value={formData.Rating}
                      onChange={(e) => handleNumberChange('Rating', parseFloat(e.target.value))}
                      placeholder="0.0 - 5.0"
                      variant="bordered"
                      isInvalid={!!validationErrors.Rating}
                      errorMessage={validationErrors.Rating}
                      className={styles.formInput}
                    />
                  </div>
                  
                  <Textarea
                    name="Discription"
                    value={formData.Discription}
                    onChange={handleChange}
                    placeholder="Enter dish description"
                    variant="bordered"
                    rows={3}
                    className={styles.formTextarea}
                  />
                </div>
                
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Dish Classifications</h3>
                  
                  <div className={styles.checkboxContainer}>
                    <p className={styles.checkboxLabel}>Type of Dish</p>
                    <div className={styles.checkboxes}>
                      {['Appetizer', 'Main Course', 'Dessert', 'Beverage'].map((type) => (
                        <Checkbox
                          key={type}
                          isSelected={dishTypes.includes(type)}
                          onValueChange={() => handleDishTypeChange(type)}
                          className={styles.checkbox}
                        >
                          {type}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.checkboxRow}>
                    <Checkbox
                      isSelected={dishTypes.includes('Veg')}
                      onValueChange={() => handleDishTypeChange('Veg')}
                      className={`${styles.checkbox} ${styles.vegCheckbox}`}
                    >
                      Vegetarian
                    </Checkbox>
                    
                    <Checkbox
                      isSelected={dishTypes.includes('Non-Veg')}
                      onValueChange={() => handleDishTypeChange('Non-Veg')}
                      className={`${styles.checkbox} ${styles.nonVegCheckbox}`}
                    >
                      Non-Vegetarian
                    </Checkbox>
                  </div>
                  
                  <div className={styles.checkboxContainer}>
                    <p className={styles.checkboxLabel}>Genre of Taste</p>
                    <div className={styles.checkboxes}>
                      {['Spicy', 'Sweet', 'Sour', 'Bitter', 'Creamy', 'Savory'].map((genre) => (
                        <Checkbox
                          key={genre}
                          isSelected={tasteGenres.includes(genre)}
                          onValueChange={() => handleTasteGenreChange(genre)}
                          className={styles.checkbox}
                        >
                          {genre}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.switchContainer}>
                    <Switch
                      isSelected={formData.Available}
                      onValueChange={(value) => setFormData({...formData, Available: value})}
                      size="lg"
                      color="success"
                    >
                      <span className={styles.switchLabel}>
                        {formData.Available ? 'Available for ordering' : 'Not available'}
                      </span>
                    </Switch>
                  </div>
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={onClose}
                className={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                isLoading={isSubmitting}
                className={styles.submitButton}
              >
                {initialData ? 'Update Dish' : 'Add Dish'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default EnhancedDishForm;