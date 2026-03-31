def est_majeur(age):
    """
    Vérifie si une personne est majeure en fonction de son âge.
    
    Paramètres :
    - age (int ou float) : L'âge de la personne.
    
    Retourne :
    - bool : True si l'âge est supérieur ou égal à 18, sinon False.
    """
    return age >= 18

def compter_voyelles(mot):
    """
    Compte le nombre de voyelles (a, e, i, o, u, y) dans un mot donné.
    La fonction n'est pas sensible à la casse (elle compte les majuscules et minuscules).
    
    Paramètres :
    - mot (str) : La chaîne de caractères à analyser.
    
    Retourne :
    - int : Le nombre total de voyelles trouvées dans la chaîne.
    """
    voyelles = "aeiouyAEIOUY"
    compteur = 0
    for lettre in mot:
        if lettre in voyelles:
            compteur += 1
    return compteur


def moyenne_liste(nombres):
    """
    Calcule la moyenne d'une liste de nombres.
    
    Paramètres :
    - nombres (list) : Une liste contenant des nombres (int ou float).
    
    Retourne :
    - float : La moyenne des nombres.
    - int : Retourne 0 si la liste est vide (pour éviter une erreur de division).
    """
    if not nombres:
        return 0
    return sum(nombres) / len(nombres)


def appliquer_reduction(prix, pourcentage):
    """
    Applique un pourcentage de réduction sur un prix initial.
    
    Paramètres :
    - prix (int ou float) : Le prix initial de l'article.
    - pourcentage (int ou float) : Le pourcentage de réduction à appliquer.
    
    Retourne :
    - float : Le prix final après la réduction.
    
    Exceptions :ement négatif.
    - ValueError : Si le pourcentage n'est pas comprisExceptions (Erreurs déclenchées) :
    - ValueError : Si le prix est strict entre 0 et 100 inclus.
    """
    if prix < 0:
        raise ValueError("Le prix ne peut pas être négatif.")
    if pourcentage < 0 or pourcentage > 100:
        raise ValueError("Le pourcentage doit être compris entre 0 et 100.")
    
    reduction = prix * (pourcentage / 100)
    return prix - reduction

