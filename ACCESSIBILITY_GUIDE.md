# Guide d'Accessibilité - BISApp

## Vue d'ensemble

BISApp propose un système complet d'accessibilité pour les utilisateurs malvoyants ou aveugles avec :

- **Text-to-Speech (TTS)** : Lecture à haute voix
- **Speech-to-Text (STT)** : Entrée vocale (dictée)
- **Contraste élevé** : Mode sombre et couleurs optimisées
- **Taille de police ajustable** : Petite, moyenne, grande, extra-large

## Flux d'activation automatique

### 1. Au démarrage (Splash Screen)

- L'app demande : "Êtes-vous déficient visuel ?"
- Si **OUI** est sélectionné → Activation automatique de :
  - ✅ TTS (Text-to-Speech)
  - ✅ STT (Speech-to-Text)
  - ✅ Contraste élevé
  - ✅ Police grande

### 2. Notifications vocales

- Une annonce de confirmation : "Accessibilité activée. Le mode lecteur mains-libres est maintenant active."
- Tous les éléments suivants sont lus à haute voix

## Fonctionnalités détaillées

### Text-to-Speech (TTS)

#### Lecture des lettres lors de la saisie

- **Pendant l'inscription et la connexion**, chaque lettre tapée est prononcée
- **Exception** : Les mots de passe ne sont PAS prononcés (pour la sécurité)
- Vitesse de prononciation : ajustée selon la taille de police

```typescript
// Exemple : Saisir "Jean"
// → Prononciation : "J", "e", "a", "n" (chaque lettre)
```

#### Lecture des instructions

- Les titres des formulaires
- Les labels des champs
- Les messages d'erreur
- Les messages de confirmation

### Speech-to-Text (STT)

#### Dictée vocale

- Appuyez sur le bouton **🎤** (microphone) dans les champs de saisie (non-mots de passe)
- Parlez votre réponse en français
- Le texte reconnu s'affiche automatiquement

```typescript
// Exemple avec le champ "Prénom"
1. Appui sur 🎤
2. L'app vous écoute (indicateur : 🔄)
3. Dites "Jean"
4. Le champ se remplit : "Jean"
5. Chaque lettre est prononcée : "J", "e", "a", "n"
```

#### Limitations

- Microphone **désactivé** pour les mots de passe
- Champ désactivé pendant la dictée (STT en cours)

### Accessibilité globale

#### Contraste élevé

- Activation auto si handicap visuel détecté
- Couleurs optimisées : fond blanc, texte sombre, bordures claires

#### Taille de police

- **Petite** : 12-14px
- **Moyenne** : 14-16px (par défaut)
- **Grande** : 16-18px
- **Extra-large** : 18-20px

Les entrées accessibles s'ajustent automatiquement :

```typescript
// Exemple : En mode "extra-large"
- Email input : 18px
- Bouton microphone : visible et plus grand
- Espacement : augmenté
```

## Tests recommandés

### Test 1 : Flux d'inscription complet

```
1. Ouvrir l'app
2. À "Êtes-vous déficient visuel ?", cliquer "OUI"
→ ✅ Entendre : "Accessibilité activée..."
3. Aller à l'inscription
4. Remplir prénom "Jean" :
   → ✅ Entendre chaque lettre : "J", "e", "a", "n"
5. Remplir email en utilisant le 🎤 :
   → ✅ Dire "jean@example.com"
   → ✅ Champ rempli
6. Remplir mot de passe "Pass123!" :
   → ✅ TAS DE PRONONCIATION (sécurité)
   → ✅ Le 🎤 est grisé
```

### Test 2 : Flux de connexion

```
1. À la page de connexion
2. Remplir email avec dictée :
   → ✅ Email prononcé (c'est pas un mot de passe)
3. Remplir mot de passe :
   → ✅ PAS DE PRONONCIATION (sécurité)
   → ✅ Microphone désactivé
```

### Test 3 : Navigation vocale complète

```
1. Activer l'accessibilité
2. Les titres d'écran sont lus automatiquement
3. Les boutons sont lus avec accessibilityLabel
4. Les erreurs sont annoncées
```

## Architecture des fichiers

```
components/
  ├── AccessibleTextInput.tsx    # Input avec TTS + STT
  ├── AccessiblePasswordInput.tsx # Input sécurisé pour mots de passe
  │
context/
  ├── AccessibilityContext.tsx   # Gestion globale accessibilité
  │
hooks/
  ├── useTTS.ts                  # Hook Text-to-Speech (expo-speech)
  ├── useSpeechToText.ts         # Hook Speech-to-Text (react-native-voice)
  │
app/
  ├── visitor-welcome.tsx        # Question handicap visuel
  ├── signup.tsx                 # Formulaire inscription accessible
  ├── login.tsx                  # Formulaire connexion accessible
```

## Variables d'environnement requises

Aucune variable supplémentaire requise pour le TTS/STT. Les fonctionnalités utilisent :

- `expo-speech` (déjà installé)
- `@react-native-voice/voice` (déjà installé)

## Limitations connues

1. **STT**: Nécessite une bonne connexion internet en certains cas
2. **TTS**: Performance dépend du matériel de l'appareil
3. **Microphone**: Permissions requises sur Android/iOS
4. **Navigateur web**: STT limité sur navigateur (polices complètes)

## Prochaines améliorations

- [ ] Commandes vocales (ex: "valider", "annuler")
- [ ] Retours haptiques améliorés
- [ ] Support langues additionnelles
- [ ] Contrôle du débit de parole
- [ ] Personnalisation des voix TTS

## Support et débogage

### Logs disponibles

```typescript
// Vérifier si TTS est activé
console.log(settings.textToSpeech);

// Vérifier si STT est activé
console.log(settings.speechToText);

// Vérifier le mode handicap visuel
console.log(isVisuallyImpaired);
```

### Dépannage

**TTS ne fonctionne pas:**

- Vérifier le volume de l'appareil
- Vérifier que `textToSpeech` est `true`
- Consulter les logs useAutoTTS

**STT ne fonctionne pas:**

- Vérifier les permissions microphone
- Vérifier la langue : `fr-FR` par défaut
- Vérifier que `speechToText` est `true`

---

**Version**: 1.0.0  
**Dernière mise à jour**: Mars 2026  
**Langue**: Français + English (en cours)
