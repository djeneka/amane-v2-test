# Traduction des campagnes (campaigns-fr.json / campaigns-en.json)

Quand la langue de l’app est en **anglais**, le contenu des campagnes (titres, descriptions, objectifs, etc.) est lu depuis **`messages/campaigns-en.json`**.  
Si ce fichier contient encore du français (copie de la génération), rien ne change à l’affichage. Il faut donc **mettre la version anglaise** dans `campaigns-en.json`.

## 1. Traduction manuelle (recommandée pour un contenu final)

1. Ouvrir **`messages/campaigns-en.json`**.
2. Pour chaque campagne (`campaigns.<id>`), remplacer **uniquement les chaînes de caractères** par leur traduction anglaise :
   - **title** : titre de la campagne
   - **description** : texte (peut contenir du HTML, à traduire en gardant les balises)
   - **impact** : objectifs (souvent du HTML)
   - **process** : étapes (souvent du HTML)
   - **location** : lieu
   - **beneficiaries** : tableau de chaînes à traduire une par une
3. Ne pas modifier les **clés** (`title`, `description`, etc.) ni les **identifiants** de campagne.
4. Sauvegarder. Au prochain rechargement avec la langue « English », l’app affichera le contenu anglais.

## 2. Traduction automatique (brouillon avec MyMemory, gratuit)

Un script utilise l’API **MyMemory** (gratuite, sans clé) pour remplir `campaigns-en.json` à partir de `campaigns-fr.json`.  
Utile pour avoir une première version à relire et corriger.

```bash
# À la racine du projet
npm run translate-campaigns-en
```

Pour relever la limite (5000 → 50000 caractères/jour), vous pouvez passer un email :

```bash
MYMEMORY_EMAIL=votre@email.com npm run translate-campaigns-en
```

Limites MyMemory : 5000 caractères/jour sans email, 50000 avec `MYMEMORY_EMAIL`. Les longs textes sont découpés automatiquement (max 500 octets par requête).

Après exécution, ouvrir **`messages/campaigns-en.json`**, relire les textes et ajuster les traductions si besoin.

## Ordre conseillé

1. **Générer** les fichiers depuis l’API : `npm run generate-campaigns`
2. **Traduire** l’anglais soit à la main dans `campaigns-en.json`, soit via `npm run translate-campaigns-en` puis relecture
3. Tester en passant la langue de l’app en anglais (paramètres ou sélecteur de langue)
