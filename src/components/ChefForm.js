import React, { useState, useEffect, useCallback } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input,
  Checkbox,
  Progress,
  Tooltip,
  Spinner
} from '@nextui-org/react';
import styles from '../styles/ChefForm.module.css';

function ChefForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    "Admin Name": '',
    "Contact Number": '',
    "Email": '',
    "Password": '',
    "Role": 'Chef',
    "Images": {}
  });
  
  const [formProgress, setFormProgress] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  
  // Reset form when modal closes
  useEffect(() => {
    if (isOpen) {
      setIsFormInitialized(true);
    }
    
    if (!isOpen) {
      // Add delay before resetting the form to prevent visual glitches
      const timer = setTimeout(() => {
        resetForm();
        setIsFormInitialized(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Calculate form completion percentage
  useEffect(() => {
    if (!isFormInitialized) return;
    
    const calculateProgress = () => {
      const requiredFields = ['Admin Name', 'Email', 'Password', 'Contact Number'];
      let completedFields = 0;
      
      requiredFields.forEach(field => {
        if (String(formData[field]).trim()) {
          completedFields++;
        }
      });
      
      // Add weight to terms
      if (acceptTerms) completedFields += 0.5;
      
      const totalRequiredWeight = requiredFields.length + 0.5;
      return Math.min(100, Math.round((completedFields / totalRequiredWeight) * 100));
    };
    
    setFormProgress(calculateProgress());
  }, [formData, acceptTerms, isFormInitialized]);
  
  // Reset form function
  const resetForm = useCallback(() => {
    setFormData({
      "Admin Name": '',
      "Contact Number": '',
      "Email": '',
      "Password": '',
      "Role": 'Chef',
      "Images": {}
    });
    setFormErrors({});
    setAcceptTerms(false);
    setShowPassword(false);
    setIsSubmitting(false);
  }, []);
  
  // Safe close handler to prevent UI glitches
  const handleSafeClose = useCallback(() => {
    if (isSubmitting) return;
    onClose();
  }, [isSubmitting, onClose]);
  
  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [formErrors]);
  
  // Format phone number input
  const handlePhoneChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setFormData(prev => ({
      ...prev,
      "Contact Number": value
    }));
    
    // Clear error for this field
    if (formErrors["Contact Number"]) {
      setFormErrors(prev => ({
        ...prev,
        "Contact Number": null
      }));
    }
  }, [formErrors]);
  
  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData["Admin Name"].trim()) {
      errors["Admin Name"] = "Chef's name is required";
    }
    
    if (!formData["Email"].trim()) {
      errors["Email"] = "Email address is required";
    } else if (!emailRegex.test(formData["Email"])) {
      errors["Email"] = "Please enter a valid email address";
    }
    
    if (!formData["Password"].trim()) {
      errors["Password"] = "Password is required";
    } else if (formData["Password"].length < 6) {
      errors["Password"] = "Password must be at least 6 characters";
    }
    
    if (!String(formData["Contact Number"]).trim()) {
      errors["Contact Number"] = "Contact number is required";
    } else if (String(formData["Contact Number"]).length < 10) {
      errors["Contact Number"] = "Please enter a valid contact number";
    }
    
    if (!acceptTerms) {
      errors.terms = "You must accept the terms to continue";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, acceptTerms]);
  
  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Prepare submission data in the exact format required
    const submissionData = {
      "Admin Name": formData["Admin Name"],
      "Contact Number": Number(formData["Contact Number"]),
      "Email": formData["Email"],
      "Password": formData["Password"],
      "Role": "Chef",
      "Images": {}
    };
    
    setTimeout(() => {
      onSubmit(submissionData);
      setIsSubmitting(false);
    }, 600);
  }, [formData, validateForm, onSubmit]);
  
  // Get progress color based on completion percentage
  const getProgressColor = useCallback(() => {
    if (formProgress < 40) return "warning";
    if (formProgress < 70) return "primary";
    return "success";
  }, [formProgress]);
  
  if (!isOpen) return null;
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleSafeClose}
      classNames={{
        base: styles.formModal,
        header: styles.modalHeader,
        body: styles.modalBody,
        footer: styles.modalFooter,
        closeButton: styles.closeButton
      }}
      backdrop="blur"
      size="md"
      placement="center"
      isDismissable={!isSubmitting}
      hideCloseButton={isSubmitting}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className={styles.formTitle}>
              <div className={styles.headerContent}>
                <div className={styles.titleSection}>
                  <h2>Add New Chef</h2>
                  <p>Create a new chef account for your restaurant</p>
                </div>
                
                <div className={styles.chefIconContainer}>
                  <div className={styles.chefIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                      <path className={styles.chefHat} d="M52 28c0-11-9-20-20-20s-20 9-20 20v8h40v-8z"/>
                      <ellipse className={styles.chefHatBrim} cx="32" cy="36" rx="28" ry="7"/>
                      <circle className={styles.chefFace} cx="32" cy="33" r="6"/>
                      <path className={styles.chefSmile} d="M29 34a3 3 0 0 0 6 0"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className={styles.progressContainer}>
                <div className={styles.progressLabels}>
                  <span>Form Completion</span>
                  <span>{formProgress}%</span>
                </div>
                <Progress 
                  value={formProgress} 
                  color={getProgressColor()}
                  size="sm"
                  radius="sm"
                  className={styles.progressBar}
                  aria-label="Form completion progress"
                />
              </div>
            </ModalHeader>
            
            <ModalBody>
              <div className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.inputWrapper}>
                    <Input
                      name="Admin Name"
                      value={formData["Admin Name"]}
                      onChange={handleChange}
                      placeholder="Enter chef's full name"
                      variant="bordered"
                      labelPlacement="outside"
                      radius="sm"
                      isRequired
                      isInvalid={!!formErrors["Admin Name"]}
                      errorMessage={formErrors["Admin Name"]}
                      isDisabled={isSubmitting}

                    />
                  </div>
                  
                  <div className={styles.inputWrapper}>
                    <Input
                      name="Contact Number"
                      type="tel"
                      value={formData["Contact Number"]}
                      onChange={handlePhoneChange}
                      placeholder="Enter phone number"
                      variant="bordered"
                      labelPlacement="outside"
                      radius="sm"
                      isRequired
                      isInvalid={!!formErrors["Contact Number"]}
                      errorMessage={formErrors["Contact Number"]}
                      isDisabled={isSubmitting}
                    />
                  </div>
                  
                  <div className={styles.inputWrapper}>
                    <Input
                      name="Email"
                      type="email"
                      value={formData["Email"]}
                      onChange={handleChange}
                      placeholder="chef@restaurant.com"
                      variant="bordered"
                      labelPlacement="outside"
                      radius="sm"
                      isRequired
                      isInvalid={!!formErrors["Email"]}
                      errorMessage={formErrors["Email"]}
                      isDisabled={isSubmitting}
                    />
                  </div>
                  
                  <div className={styles.inputWrapper}>
                    <Input
                      name="Password"
                      type={showPassword ? "text" : "password"}
                      value={formData["Password"]}
                      onChange={handleChange}
                      placeholder="Create a secure password"
                      variant="bordered"
                      labelPlacement="outside"
                      radius="sm"
                      isRequired
                      isInvalid={!!formErrors["Password"]}
                      errorMessage={formErrors["Password"]}
                      isDisabled={isSubmitting}
                      endContent={
                        <button
                          type="button"
                          onClick={() => !isSubmitting && setShowPassword(!showPassword)}
                          className={styles.passwordToggle}
                          disabled={isSubmitting}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                        </button>
                      }
                    />
                  </div>
                </div>
                
                <div className={styles.checkboxWrapper}>
                  <Checkbox
                    isSelected={acceptTerms}
                    onValueChange={(value) => !isSubmitting && setAcceptTerms(value)}
                    isInvalid={!!formErrors.terms}
                    isDisabled={isSubmitting}
                    color="primary"
                  >
                    <span className={styles.termsText}>
                      I confirm that this chef is authorized to work in our restaurant
                    </span>
                  </Checkbox>
                  {formErrors.terms && (
                    <div className={styles.checkboxError}>{formErrors.terms}</div>
                  )}
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={handleSafeClose}
                className={styles.cancelButton}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                className={styles.submitButton}
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={formProgress < 40 || isSubmitting}
                spinner={<Spinner size="sm" color="white" />}
                startContent={!isSubmitting && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )}
              >
                Add Chef
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default ChefForm;