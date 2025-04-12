import React, { useState } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input
} from '@nextui-org/react';

function ChefForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Password: ''
  });
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      Name: '',
      Email: '',
      Password: ''
    });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Add New Chef</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  placeholder="Enter chef name"
                  variant="bordered"
                  isRequired
                />
                
                <Input
                  label="Email"
                  name="Email"
                  type="email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  variant="bordered"
                  isRequired
                />
                
                <Input
                  label="Password"
                  name="Password"
                  type="password"
                  value={formData.Password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  variant="bordered"
                  isRequired
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
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