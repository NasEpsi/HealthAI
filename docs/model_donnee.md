# Modèles de données

## PostgreSQL

La base relationnelle conserve les tables historiques du projet précédent :
- utilisateur
- aliment
- nutrition_log
- session_sport
- qualite_run

La V2 ajoute :
- user_profile
- meal_analysis
- nutrition_recommendation
- workout_recommendation
- recommendation_history

## MongoDB

MongoDB stocke les documents générés par le micro-service IA :
- input utilisateur
- output généré
- type de recommandation
- statut
- version moteur
- date de création

Ce choix permet de stocker des documents souples et évolutifs.