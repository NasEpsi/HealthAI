import unittest
from exemple import est_majeur, compter_voyelles, moyenne_liste, appliquer_reduction

def test_est_majeur(self):
    age = 21
    # Act
    est_majeur(age)
    
    # Assert
    self.assert_True(est_majeur, True)
    age = 4
    
    # Act
    est_majeur(age)
    
    # Assert
    self.assert_False(est_majeur, False)
    
def test_compter_voyelle(self):
    # Arrange
    mot = "Bonjour"
    # Act
    voyelles = compter_voyelles(mot)
    # Assert
    self.assert_equal(voyelles, 3)
    
def test_moyenne_list(self):
    # Arrange
    liste = [1, 2, 3, 4, 5]
    # Act
    moyenne = moyenne_liste(liste)
    # Assert
    self.assert_equal(moyenne, 3)
    
def test_appliquer_reduction(self):
    # Arrange
    prix = 100
    reduction = 10
    # Act
    prix_reduit = appliquer_reduction(prix, reduction)
    # Assert
    self.assert_equal(prix_reduit, 90)
    
def test_appliquer_reduction_erreur_prix_negatif(self):
    prix = -10
    reduction = 20
    
    with self.assertRaises(ValueError):
        appliquer_reduction(prix, reduction)
        
        
def test_appliquer_reduction_erreur_pourcentage_negatif(self):
    prix = 100
    reduction = -20
    
    with self.assertRaises(ValueError):
        appliquer_reduction(prix, reduction) 