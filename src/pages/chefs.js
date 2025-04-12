import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  Button, 
  useDisclosure,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from '@nextui-org/react';
import { getChefs, createChef, deleteChef } from '../utils/api';
import ChefForm from '../components/ChefForm';
import { isManager } from '../utils/auth';
import { useRouter } from 'next/router';

function Chefs() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Check authorization on mount
  useEffect(() => {
    // Only check on client-side
    const checkAccess = () => {
      const hasAccess = isManager();
      setAuthorized(hasAccess);
      
      if (!hasAccess) {
        router.push('/dashboard');
      } else {
        fetchChefs();
      }
    };
    
    checkAccess();
  }, [router]);
  
  const fetchChefs = async () => {
    setLoading(true);
    try {
      const chefsData = await getChefs();
      setChefs(chefsData);
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle creating new chef
  const handleCreateChef = async (chefData) => {
    try {
      await createChef(chefData);
      onClose();
      fetchChefs();
    } catch (error) {
      console.error('Error creating chef:', error);
    }
  };
  
  // Handle deleting chef
  const handleDeleteChef = async (chefId) => {
    try {
      setDeleting(true);
      await deleteChef(chefId);
      // Update local state instead of refetching to avoid table issues
      setChefs(prevChefs => prevChefs.filter(chef => chef['Chef Id'] !== chefId));
    } catch (error) {
      console.error('Error deleting chef:', error);
    } finally {
      setDeleting(false);
    }
  };
  
  // If not authorized, show loading until redirect happens
  if (!authorized) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chef Management</h1>
        
        <Button color="primary" onPress={onOpen}>
          Add New Chef
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Card>
          <CardBody>
            <Table aria-label="Chefs Table">
              <TableHeader>
                <TableColumn>CHEF ID</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {chefs.length > 0 ? (
                  chefs.map((chef) => (
                    <TableRow key={chef['Chef Id']}>
                      <TableCell>{chef['Chef Id']}</TableCell>
                      <TableCell>{chef.Name}</TableCell>
                      <TableCell>{chef.Email}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          color="danger" 
                          variant="flat"
                          isLoading={deleting}
                          onPress={() => handleDeleteChef(chef['Chef Id'])}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-chefs">
                    <TableCell>No chefs found</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}
      
      <ChefForm 
        isOpen={isOpen} 
        onClose={onClose}
        onSubmit={handleCreateChef}
      />
    </div>
  );
}

export default Chefs;