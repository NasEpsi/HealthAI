# Choix IA

Pour le MVP, nous avons retenu une approche hybride basée sur un moteur de règles métier.

Ce choix permet de répondre rapidement au besoin de recommandations personnalisées tout en conservant une architecture compatible avec une future intégration d’API IA externes comme Hugging Face, Google Vision ou Ollama.

## Nutrition

Le moteur prend en compte :
- objectif utilisateur
- calories
- protéines
- glucides
- lipides
- aliments détectés ou saisis

## Sport

Le moteur prend en compte :
- objectif
- niveau
- durée
- équipements disponibles
- limitations physiques

## Évolution possible

Le micro-service pourra évoluer vers :
- reconnaissance visuelle réelle des repas
- modèle NLP pour recommandations textuelles
- modèle prédictif personnalisé