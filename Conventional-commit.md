
---

# SPEC – Spécification Technique : Conventional Commits

| **Version** | **Date** | **Auteur** | **Modifications** |
|-------------|----------|------------|-------------------|
| 1.0 | 2026-03-28 | Hadjour/devops_formation | Création initiale de la spécification |

## 1. Objectif
Standardiser le format des messages de commit afin  simplifier la navigation dans l'historique du code source et dans un deuxieme temps si possible d'automatiser la génération de *changelogs*, le versionnage sémantique (SemVer) .

## 2. Périmètre
Cette spécification s'applique à l'ensemble des dépôts de code source (back-end, front-end, ci-cd, infrastructure as code) gérés par l'équipe.

## 3. Contexte et Contraintes
- **Découplage** : Le format doit être interprétable par des outils CI/CD (GitHub Actions, GitLab CI, etc.) sans traitement manuel.
- **Lisibilité** : Un développeur doit pouvoir comprendre l'impact d'un commit sans avoir à lire le code.
- **Interopérabilité** : Respect strict du standard [Conventional Commits 1.0.0](https://www.conventionalcommits.org/).

## 4. Architecture du Message

```
<type>[portée optionnelle]: <description>

[corps optionnel]

[pied-de-page optionnel]
```

### 4.1. **Type** (Obligatoire)
Définit la nature de la modification. Valeurs autorisées :

| Type | Description | Incrément SemVer |
|------|-------------|------------------|
| `feat` | Nouvelle fonctionnalité pour l'utilisateur | **MINOR** |
| `fix` | Correction d'un bug | **PATCH** |
| `docs` | Modification de la documentation uniquement | – |
| `style` | Correction de formatage (espaces, points-virgules, etc.) | – |
| `refactor` | Modification du code sans correction de bug ni ajout de fonctionnalité | – |
| `perf` | Amélioration des performances | **PATCH** (si impact utilisateur) |
| `test` | Ajout ou correction de tests | – |
| `chore` | Mise à jour des tâches de build, configs, dépendances | – |
| `ci` | Modification des scripts d'intégration continue | – |
| `build` | Modification du système de build ou dépendances externes | – |
| `revert` | Annulation d'un commit précédent | – |

### 4.2. **Portée** (Optionnelle)
Indique le module ou composant impacté (ex: `auth`, `api`, `ui`, `db`).  
*Format* : `(portée)`

### 4.3. **Description** (Obligatoire)
- Commence par une minuscule.
- Ne se termine pas par un point.
- Temps impératif présent (ex : "ajoute" au lieu de "ajouté").
- Maximum 50 caractères.

### 4.4. **Corps** (Optionnel)
- Explique le **quoi** et le **pourquoi**, pas le *comment* (le code est le commentaire).
- Lignes limitées à 72 caractères.
- Séparé de la description par une ligne vide.

### 4.5. **Pied-de-page** (Optionnel)
Utilisé pour :
- **Références** : `Refs: #123, #456`
- **Changements cassants** : `BREAKING CHANGE: description`
- **Clôture d'issues** : `Fixes #789`

## 5. Gestion des Changements Cassants (Breaking Changes)
Un *breaking change* (changement incompatible avec les versions antérieures) se signale de deux manières :

1. **Dans le pied-de-page** :
   ```
   BREAKING CHANGE: La méthode authenticate ne prend plus d'objet session.
   ```
2. **Dans le type** (si la portée est disponible) :
   `feat(api)!: refonte complète du endpoint /users`

Dans les deux cas, cela déclenche un incrément **MAJOR** en SemVer.

## 6. Règles d'Automatisation (CI/CD)

Le pipeline CI doit effectuer les contrôles suivants :

| Étape | Action | Outil recommandé |
|-------|--------|------------------|
| **Validation syntaxique** | Vérifier que le message respecte la regex du standard | `commitlint` |
| **SemVer auto** | Déterminer la prochaine version basée sur les types + BREAKING | `semantic-release` |
| **Changelog** | Générer `CHANGELOG.md` automatiquement à chaque release | `standard-version` |
| **Blocage** | Bloquer le push si un commit est invalide | Husky + hook commit-msg |


## 7. Exemples Conformes

### 7.1. Simple
```
feat(auth): ajoute la connexion par empreinte digitale
```

### 7.2. Avec corps
```
fix(api): corrige la validation du token JWT

Le token expiré retournait une 500 au lieu d'une 401.
Ajout d'un middleware de gestion d'erreur spécifique.

Refs: #342
```

### 7.3. Changement Cassant
```
refactor(db)!: migre vers Prisma ORM

BREAKING CHANGE: Les modèles Sequelize ne sont plus supportés.
Les migrations doivent être réécrites.
```

## 8. Gestion des Exceptions
- **Commit de merge** : Le format standard n'est pas requis (message généré par Git). Aucun contrôle effectué par `commitlint`.
- **Hotfix** : Utiliser `fix` avec un corps détaillant la correction et un lien vers le ticket d'incident.

## 9. Livrables & Métriques
- **utilisation** : 

        git pull 
        npm install 
        git add . 
        npx cz 

        
- **Audit** : Rapport hebdomadaire du taux de commits conformes.
- **Documentation** : Page dans le wiki du projet rappelant ces règles.
- **Formation** : Session d'1h pour les nouveaux arrivants sur l'utilisation du standard.

## 10. Références
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Commitlint](https://commitlint.js.org/)
- [Semantic Release](https://semantic-release.gitbook.io/)

---

**Approbations** :  
*Tech Lead* : _______________  
*Lead Dev* : _______________  
*Date d'application* : `YYYY-MM-DD`

---
