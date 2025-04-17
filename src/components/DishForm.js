import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
  Progress,
  Card,
  Image
} from '@nextui-org/react';
import styles from '../styles/DishForm.module.css';

function EnhancedDishForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
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
  
  const [dishTypes, setDishTypes] = useState([]);
  const [tasteGenres, setTasteGenres] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formCompletion, setFormCompletion] = useState(0);
  
  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  
  // Update form data when initialData changes or when the modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        Name: initialData.Name || '',
        Price: initialData.Price || '',
        Discription: initialData.Discription || '',
        Rating: initialData.Rating || 0,
        'Cooking Time': initialData['Cooking Time'] || '',
        Images: initialData.Images || [],
        'Type of Dish': initialData['Type of Dish'] || [],
        'Genre of Taste': initialData['Genre of Taste'] || [],
        Available: initialData.Available !== undefined ? initialData.Available : true
      });
      
      setDishTypes(initialData['Type of Dish'] || []);
      setTasteGenres(initialData['Genre of Taste'] || []);
      
      // Set preview image if dish has an image
      if (initialData.Images && initialData.Images.length > 0) {
        setPreviewUrl(initialData.Images[0]);
      } else {
        setPreviewUrl('');
      }
    } else {
      // Reset form when adding a new dish
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
      setPreviewUrl('');
    }
    
    // Clear validation errors when opening the form
    setValidationErrors({});
    setImageFile(null);
    setUploadProgress(0);
    setUploadError('');
  }, [initialData, isOpen]);
  
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
    if (formData.Images && formData.Images.length > 0) fieldsCompleted++;
    
    // Calculate percentage
    const totalFields = requiredFields.length + 5; // Required + other fields + image
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
  
  // Handle image file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }
    
    setImageFile(file);
    setUploadError('');
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle file upload
  const handleFileUpload = async () => {
    if (!imageFile) {
      setUploadError('Please select an image first');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    
    // Create form data
    const uploadData = new FormData();
    uploadData.append('image', imageFile);
    
    try {
      // Upload the image
      const response = await axios.post('http://localhost:3000/Dish/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      
      // Update form data with the image URL
      setFormData({
        ...formData,
        Images: [...formData.Images, response.data.url]
      });
      
      setUploadProgress(100);
      
      // Add fancy delay for better UX
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
      setIsUploading(false);
    }
  };
  
  // Remove image
  const handleRemoveImage = () => {
    setPreviewUrl('');
    setImageFile(null);
    setUploadProgress(0);
    setFormData({
      ...formData,
      Images: []
    });
  };
  
  // Open file dialog
  const triggerFileInput = () => {
    fileInputRef.current.click();
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
    
    // Upload image first if there's a new image file selected but not uploaded yet
    if (imageFile && !formData.Images.includes(previewUrl) && previewUrl) {
      await handleFileUpload();
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        Price: parseInt(formData.Price),
        Rating: parseFloat(formData.Rating) || 0
      };
      
      await onSubmit(submissionData);
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
                {/* Image Upload Section */}
                <div className={`${styles.formSection} ${styles.imageSection}`}>
                  <h3 className={styles.sectionTitle}>Dish Image</h3>
                  
                  <div className={styles.imageUploadContainer}>
                    {/* Image Preview */}
                    <div className={styles.imagePreviewWrapper}>
                      {previewUrl ? (
                        <div className={styles.previewContainer}>
                          <img 
                            src={previewUrl} 
                            alt="Dish preview" 
                            className={styles.imagePreview}
                          />
                          <button 
                            className={styles.removeImageBtn}
                            type="button"
                            onClick={handleRemoveImage}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className={styles.uploadPlaceholder} onClick={triggerFileInput}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                          <p className="text-gray-500 mt-2">Click to upload dish image</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Controls */}
                    <div className={styles.uploadControls}>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileSelect} 
                        className={styles.fileInput} 
                        accept="image/jpeg, image/png, image/jpg, image/webp"
                      />
                      
                      <div className={styles.uploadActions}>
                        <Button
                          color="primary"
                          variant="flat"
                          onClick={triggerFileInput}
                          className={styles.uploadButton}
                          startContent={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                            </svg>
                          }
                        >
                          Select Image
                        </Button>
                        
                        {imageFile && !formData.Images.includes(previewUrl) && (
                          <Button
                            color="success"
                            variant="flat"
                            onClick={handleFileUpload}
                            isLoading={isUploading}
                            className={styles.uploadButton}
                            startContent={
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                              </svg>
                            }
                          >
                            Upload
                          </Button>
                        )}
                      </div>
                      
                      {/* Upload Progress */}
                      {isUploading && (
                        <div className={styles.uploadProgressContainer}>
                          <Progress 
                            size="sm" 
                            radius="sm" 
                            value={uploadProgress} 
                            color="success"
                            className={styles.uploadProgress}
                            showValueLabel={true}
                          />
                          <p className={styles.uploadProgressText}>
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}
                      
                      {/* Error message */}
                      {uploadError && (
                        <p className={styles.uploadError}>{uploadError}</p>
                      )}
                    </div>
                  </div>
                </div>
                
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
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">₹</span>
                        </div>
                      }
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
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
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
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-yellow-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      }
                    />
                  </div>
                  
                  <Textarea
                    label="Description"
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