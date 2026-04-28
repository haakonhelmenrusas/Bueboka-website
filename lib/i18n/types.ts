export type Locale = 'no' | 'en';

export interface TranslationKeys {
  // Navigation
  'nav.community': string;
  'nav.team': string;
  'nav.support': string;
  'nav.activity': string;
  'nav.archers': string;
  'nav.sightMarks': string;
  'nav.feedback': string;
  'nav.login': string;
  'nav.register': string;
  'nav.logout': string;
  'nav.settings': string;
  'nav.myPage': string;
  'nav.openProfileMenu': string;
  'nav.toggleMobileMenu': string;
  'nav.goDashboard': string;

  // Hero section
  'hero.subtitle': string;
  'hero.orUseWeb': string;
  'hero.registerUser': string;
  'hero.alreadyHaveAccount': string;
  'hero.login': string;

  // Auth pages
  'auth.goToFrontPage': string;
  'auth.loginTitle': string;
  'auth.loginBrandDesc': string;
  'auth.loginFeature1': string;
  'auth.loginFeature2': string;
  'auth.loginFeature3': string;
  'auth.loginFormLegend': string;
  'auth.emailLabel': string;
  'auth.passwordLabel': string;
  'auth.forgotPassword': string;
  'auth.loginButton': string;
  'auth.loginWithGoogle': string;
  'auth.noAccount': string;
  'auth.createUser': string;
  'auth.registerTitle': string;
  'auth.registerBrandDesc': string;
  'auth.nameLabel': string;
  'auth.confirmPasswordLabel': string;
  'auth.registerButton': string;
  'auth.registerWithGoogle': string;
  'auth.alreadyHaveAccountPrompt': string;
  'auth.loginHere': string;

  // Validation errors (returned as translation keys from validation functions)
  'validation.emailMissing': string;
  'validation.emailInvalid': string;
  'validation.passwordMissing': string;
  'validation.passwordMinLength': string;
  'validation.nameMissing': string;
  'validation.passwordsMismatch': string;
  'validation.wrongCredentials': string;
  'validation.genericError': string;

  // Bow/arrow/category labels
  'label.bowRecurve': string;
  'label.bowCompound': string;
  'label.bowLongbow': string;
  'label.bowBarebow': string;
  'label.bowHorsebow': string;
  'label.bowTraditional': string;
  'label.bowOther': string;
  'label.arrowCarbon': string;
  'label.arrowAluminium': string;
  'label.arrowWood': string;
  'label.categoryIndoor': string;
  'label.categoryOutdoor': string;
  'label.category3D': string;
  'label.categoryFelt': string;
  'label.envIndoor': string;
  'label.envOutdoor': string;
  'label.anonymousArcher': string;

  // Dashboard
  'dashboard.errorLoading': string;
  'dashboard.loginRequired': string;

  // Quick actions
  'quickAction.newPractice': string;
  'quickAction.newCompetition': string;
  'quickAction.newBow': string;
  'quickAction.newArrow': string;

  // Profile card
  'profile.editAvatar': string;
  'profile.uploadImage': string;
  'profile.removeImage': string;
  'profile.noClub': string;
  'profile.imageTooLarge': string;
  'profile.notAnImage': string;
  'profile.uploadError': string;

  // Settings
  'settings.title': string;
  'settings.deleteAccount': string;
  'settings.deleteAccountDesc': string;
  'settings.confirmDeleteTitle': string;
  'settings.confirmDeleteMessage': string;
  'settings.confirmDeleteButton': string;
  'settings.cancelButton': string;
  'settings.saveSuccess': string;
  'settings.savingError': string;
  'settings.labelName': string;
  'settings.labelEmail': string;
  'settings.labelClub': string;
  'settings.labelArcherNumber': string;
  'settings.editProfile': string;
  'settings.makePublic': string;
  'settings.makePublicHelp': string;
  'settings.choosePublicFields': string;
  'settings.back': string;
  'settings.deleting': string;

  // Feedback modal
  'feedback.title': string;
  'feedback.ratingLabel': string;
  'feedback.textLabel': string;
  'feedback.placeholder': string;
  'feedback.submit': string;
  'feedback.submitting': string;
  'feedback.cancel': string;
  'feedback.errorNoRating': string;
  'feedback.errorNoText': string;
  'feedback.errorSend': string;

  // Footer
  'footer.downloadCta': string;
  'footer.partners': string;
  'footer.partnerDesc': string;
  'footer.visitWebsite': string;
  'footer.allRightsReserved': string;

  // Call to action / landing sections
  'cta.title': string;
  'cta.subtitle': string;
  'cta.feature1Title': string;
  'cta.feature1Text': string;
  'cta.feature2Title': string;
  'cta.feature2Text': string;
  'cta.feature3Title': string;
  'cta.feature3Text': string;
  'cta.registerButton': string;
  'cta.alreadyHaveAccount': string;
  'cta.loginHere': string;

  // Language switcher
  'lang.norwegian': string;
  'lang.english': string;
  'lang.switchTo': string;

  // Common
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.loading': string;
  'common.error': string;
  'common.back': string;
}
