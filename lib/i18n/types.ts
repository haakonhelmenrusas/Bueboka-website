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
  'profile.viewAchievements': string;

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
  'common.updating': string;
  'common.saving': string;
  'common.deleting': string;
  'common.edit': string;
  'common.add': string;
  'common.close': string;
  'common.discard': string;
  'common.continue': string;
  'common.next': string;
  'common.previous': string;
  'common.pleaseWait': string;
  'common.send': string;
  'common.sending': string;
  'common.characters': string;
  'common.of': string;
  'common.page': string;
  'common.seeAll': string;
  'common.update': string;
  'common.all': string;
  'common.noResults': string;
  'common.optional': string;
  'common.favorite': string;

  // Form fields (shared across practice/competition forms)
  'form.date': string;
  'form.category': string;
  'form.environment': string;
  'form.location': string;
  'form.locationPlaceholder': string;
  'form.weather': string;
  'form.notes': string;
  'form.bow': string;
  'form.selectBow': string;
  'form.arrows': string;
  'form.selectArrows': string;
  'form.distance': string;
  'form.score': string;
  'form.round': string;
  'form.prevStep': string;
  'form.nextStep': string;
  'form.target': string;
  'form.choose': string;
  'form.arrowsWithScore': string;
  'form.arrowsPerEnd': string;
  'form.arrowsWithoutScore': string;
  'form.from': string;
  'form.to': string;

  // Confirm modal defaults
  'confirm.defaultConfirm': string;
  'confirm.defaultCancel': string;
  'confirm.pleaseWait': string;

  // Practice
  'practice.deleteError': string;
  'practice.saveError': string;
  'practice.editTitle': string;
  'practice.newTitle': string;
  'practice.deleteButton': string;
  'practice.deleteConfirmTitle': string;
  'practice.deleteConfirmMessage': string;
  'practice.discardTitle': string;
  'practice.discardMessage': string;
  'practice.discardConfirm': string;
  'practice.noRecords': string;
  'practice.recentActivity': string;
  'practice.allActivity': string;
  'practice.filterAll': string;
  'practice.filterPractices': string;
  'practice.filterCompetitions': string;
  'practice.addRound': string;
  'practice.maxRounds': string;
  'practice.removeRound': string;
  'practice.reflectionPlaceholder': string;
  'practice.reflectionHelp': string;
  'practice.saveChanges': string;
  'practice.savePractice': string;
  'practice.ratingLabel': string;
  'practice.ratingHelp': string;
  'practice.ratingOf10': string;
  'practice.notesHelp': string;

  // Practice details modal
  'practiceDetails.arrowsShot': string;
  'practiceDetails.location': string;
  'practiceDetails.weather': string;
  'practiceDetails.bow': string;
  'practiceDetails.arrowsLabel': string;
  'practiceDetails.unscoredArrows': string;
  'practiceDetails.arrows': string;
  'practiceDetails.rounds': string;
  'practiceDetails.notesLabel': string;
  'practiceDetails.deleteError': string;
  'practiceDetails.share': string;
  'practiceDetails.edit': string;
  'practiceDetails.category': string;
  'practiceDetails.totalScore': string;

  // Competition
  'competition.nameLabel': string;
  'competition.namePlaceholder': string;
  'competition.organizerLabel': string;
  'competition.organizerHelp': string;
  'competition.nameRequired': string;
  'competition.saveError': string;
  'competition.editTitle': string;
  'competition.newTitle': string;
  'competition.deleteButton': string;
  'competition.deleteConfirmTitle': string;
  'competition.deleteConfirmMessage': string;
  'competition.discardTitle': string;
  'competition.discardMessage': string;
  'competition.discardConfirm': string;
  'competition.placementLabel': string;
  'competition.placementHelp': string;
  'competition.participantsLabel': string;
  'competition.participantsHelp': string;
  'competition.personalBest': string;
  'competition.placementHeading': string;
  'competition.reflectionPlaceholder': string;
  'competition.reflectionHelp': string;
  'competition.rounds.from': string;
  'competition.rounds.to': string;
  'competition.rounds.distance': string;
  'competition.rounds.target': string;
  'competition.rounds.select': string;
  'competition.rounds.arrowsWithScore': string;
  'competition.rounds.arrowsWithoutScore': string;
  'competition.rounds.addRound': string;
  'competition.rounds.maxRounds': string;
  'competition.rounds.removeRound': string;
  'competition.stepGoTo': string;
  'competition.saveChanges': string;
  'competition.saveCompetition': string;
  'competition.deleteError': string;
  'competition.sectionEquipment': string;

  // Arrows modal
  'arrows.updateError': string;
  'arrows.addError': string;
  'arrows.updated': string;
  'arrows.added': string;
  'arrows.deleteError': string;
  'arrows.deleted': string;
  'arrows.editTitle': string;
  'arrows.addTitle': string;
  'arrows.deleteButton': string;

  // Bow modal
  'bow.updateError': string;
  'bow.addError': string;
  'bow.updated': string;
  'bow.added': string;
  'bow.deleteError': string;
  'bow.deleted': string;
  'bow.editTitle': string;
  'bow.addTitle': string;
  'bow.deleteButton': string;

  // Equipment section
  'equipment.title': string;
  'equipment.editBow': string;
  'equipment.editArrows': string;
  'equipment.noBows': string;
  'equipment.addFirstArrows': string;
  'equipment.stringHeight': string;
  'equipment.maxArrowSets': string;
  'equipment.favorite': string;

  // Email verification
  'emailVerification.notVerified': string;
  'emailVerification.sending': string;
  'emailVerification.resend': string;
  'emailVerification.sent': string;
  'emailVerification.sendError': string;
  'emailVerification.closeAlert': string;

  // Mobile action button
  'mobileAction.newArrows': string;
  'mobileAction.close': string;
  'mobileAction.create': string;

  // Sight marks section
  'sightMarks.title': string;
  'sightMarks.new': string;
  'sightMarks.closeError': string;
  'sightMarks.noBow': string;
  'sightMarks.fetchError': string;
  'sightMarks.noBowSpec': string;
  'sightMarks.updateError': string;
  'sightMarks.calculateError': string;
  'sightMarks.saveError': string;
  'sightMarks.unknownError': string;

  // Sight mark form modal
  'sightMarkForm.editTitle': string;
  'sightMarkForm.newTitle': string;
  'sightMarkForm.infoText': string;
  'sightMarkForm.nameLabel': string;
  'sightMarkForm.namePlaceholder': string;
  'sightMarkForm.bowLabel': string;
  'sightMarkForm.selectBow': string;
  'sightMarkForm.noBows': string;
  'sightMarkForm.addBowFirst': string;
  'sightMarkForm.arrowsLabel': string;
  'sightMarkForm.selectArrows': string;
  'sightMarkForm.noArrows': string;
  'sightMarkForm.addArrowsFirst': string;
  'sightMarkForm.addMarkDivider': string;
  'sightMarkForm.distanceLabel': string;
  'sightMarkForm.markLabel': string;
  'sightMarkForm.deleteSet': string;
  'sightMarkForm.saveMark': string;
  'sightMarkForm.selectBowFirst': string;
  'sightMarkForm.selectArrowsFirst': string;
  'sightMarkForm.fillPositiveValues': string;
  'sightMarkForm.saveError': string;
  'sightMarkForm.deleteError': string;

  // Sight marks table
  'sightMarksTable.noMarks': string;
  'sightMarksTable.marks': string;
  'sightMarksTable.noRegistered': string;
  'sightMarksTable.distance': string;
  'sightMarksTable.mark': string;
  'sightMarksTable.calculated': string;
  'sightMarksTable.removeMark': string;
  'sightMarksTable.editFor': string;

  // Siktemerker page
  'siktemerker.home': string;
  'siktemerker.title': string;
  'siktemerker.calculated': string;
  'siktemerker.selectCalculate': string;
  'siktemerker.bow': string;
  'siktemerker.unknownBow': string;
  'siktemerker.distances': string;
  'siktemerker.arrows': string;
  'siktemerker.noMarks': string;
  'siktemerker.noMarksText': string;
  'siktemerker.fewMarks': string;
  'siktemerker.fewMarksText': string;
  'siktemerker.noCalculated': string;
  'siktemerker.noCalculatedText': string;
  'siktemerker.hideVelocities': string;
  'siktemerker.showVelocities': string;
  'siktemerker.shareOrPrint': string;
  'siktemerker.recalculate': string;
  'siktemerker.removeCalculation': string;
  'siktemerker.fetchError': string;
  'siktemerker.genericError': string;

  // Skyttere page
  'skyttere.title': string;
  'skyttere.subtitle': string;
  'skyttere.searchPlaceholder': string;
  'skyttere.searchAriaLabel': string;
  'skyttere.startTyping': string;

  // Public profile page
  'publicProfile.backToSearch': string;
  'publicProfile.profileImageAlt': string;
  'publicProfile.statsTitle': string;
  'publicProfile.totalArrows': string;
  'publicProfile.avgScorePerArrow': string;
  'publicProfile.achievementsTitle': string;
  'publicProfile.achievementsUnlocked': string;

  // Aktivitet page
  'aktivitet.title': string;
  'aktivitet.updatePracticeError': string;
  'aktivitet.updateCompetitionError': string;

  // Achievements page
  'achievements.loading': string;
  'achievements.title': string;
  'achievements.subtitle': string;
  'achievements.unlocked': string;
  'achievements.total': string;
  'achievements.completed': string;
  'achievements.points': string;
  'achievements.statusFilter': string;
  'achievements.categoryFilter': string;
  'achievements.rarityFilter': string;
  'achievements.filterAll': string;
  'achievements.filterUnlocked': string;
  'achievements.filterLocked': string;
  'achievements.noResults': string;
  'achievements.noResultsHint': string;
  'achievements.categoryMilestone': string;
  'achievements.categoryStreak': string;
  'achievements.categoryPerformance': string;
  'achievements.categoryCompetition': string;
  'achievements.rarityCommon': string;
  'achievements.rarityUncommon': string;
  'achievements.rarityRare': string;
  'achievements.rarityEpic': string;
  'achievements.rarityLegendary': string;
  'achievements.back': string;

  // Dashboard (min-side)
  'dashboard.summary': string;
  'dashboard.viewStats': string;
  'dashboard.updateImageError': string;
  'dashboard.savePracticeError': string;
  'dashboard.saveCompetitionError': string;
  'dashboard.fieldErrors': string;

  // Glemt passord page
  'glemtPassord.title': string;
  'glemtPassord.emailMissing': string;
  'glemtPassord.sendError': string;
  'glemtPassord.success': string;
  'glemtPassord.sendButton': string;
  'glemtPassord.sending': string;

  // Tilbakestill passord page
  'tilbakestillPassord.title': string;
  'tilbakestillPassord.noToken': string;
  'tilbakestillPassord.passwordMissing': string;
  'tilbakestillPassord.error': string;
  'tilbakestillPassord.success': string;
  'tilbakestillPassord.passwordLabel': string;
  'tilbakestillPassord.saveButton': string;
  'tilbakestillPassord.saving': string;

  // Verify email page
  'verifyEmail.verifying': string;
  'verifyEmail.pleaseWait': string;
  'verifyEmail.success': string;
  'verifyEmail.error': string;
  'verifyEmail.invalidLink': string;
  'verifyEmail.confirmed': string;
  'verifyEmail.expired': string;
  'verifyEmail.genericError': string;
  'verifyEmail.goToLogin': string;

  // Aktivitet banner
  'aktBanner.title': string;
  'aktBanner.description': string;
  'aktBanner.close': string;

  // App store badge
  'appStore.downloadIOS': string;
  'appStore.downloadAndroid': string;
  'appStore.downloadOn': string;
  'appStore.getOn': string;

  // Profile edit modal
  'profileEdit.updated': string;
  'profileEdit.error': string;
  'profileEdit.title': string;
  'profileEdit.noClub': string;
  'profileEdit.nameLabel': string;
  'profileEdit.nameHelp': string;
  'profileEdit.clubLabel': string;
  'profileEdit.clubHelp': string;
  'profileEdit.archerNumberLabel': string;
  'profileEdit.archerNumberHelp': string;

  // Statistics
  'statistics.backButton': string;
  'statistics.title': string;
  'statistics.subtitle': string;
  'statistics.noData': string;
  'statistics.noDataDesc': string;
  'statistics.feature1Title': string;
  'statistics.feature1Text': string;
  'statistics.feature2Title': string;
  'statistics.feature2Text': string;
  'statistics.feature3Title': string;
  'statistics.feature3Text': string;
  'statistics.goToMyPage': string;
  'statistics.timePeriod': string;
  'statistics.filter7days': string;
  'statistics.filter30days': string;
  'statistics.filter90days': string;
  'statistics.downloadCSV': string;
  'statistics.arrowsOverTime': string;
  'statistics.groupedByDistance': string;
  'statistics.arrowCount': string;
  'statistics.date': string;
  'statistics.avgScorePerArrow': string;
  'statistics.trainingVsCompetition': string;
  'statistics.avgScoreYAxis': string;
  'statistics.training': string;
  'statistics.competition': string;
  'statistics.breakdownTitle': string;
  'statistics.sessions': string;
  'statistics.arrows': string;
  'statistics.arrowsWithScore': string;
  'statistics.arrowsWithoutScore': string;
  'statistics.arrowsPerSession': string;
  'statistics.avgScore': string;
  'statistics.perArrow': string;

  // Nav skip link
  'nav.skipToContent': string;

  // Features section
  'features.title': string;
  'features.subtitle': string;
  'features.1title': string;
  'features.1text': string;
  'features.2title': string;
  'features.2text': string;
  'features.3title': string;
  'features.3text': string;

  // Privacy section
  'privacy.title': string;
  'privacy.subtitle': string;
  'privacy.1title': string;
  'privacy.1text': string;
  'privacy.2title': string;
  'privacy.2text': string;
  'privacy.3title': string;
  'privacy.3text': string;
  'privacy.3link': string;
  'privacy.footerText': string;

  // Contact form
  'contact.heading': string;
  'contact.honeypotLabel': string;
  'contact.nameLabel': string;
  'contact.namePlaceholder': string;
  'contact.emailLabel': string;
  'contact.emailPlaceholder': string;
  'contact.messageLabel': string;
  'contact.messagePlaceholder': string;
  'contact.sendButton': string;
  'contact.sending': string;
  'contact.success': string;
  'contact.error': string;

  // Round card (PracticeDetailsModal)
  'roundCard.arrows': string;
  'roundCard.points': string;

  // Session type / environment badges
  'badge.competition': string;
  'badge.training': string;
  'badge.indoor': string;
  'badge.outdoor': string;

  // Achievement badge
  'achievementBadge.unlocked': string;
  'achievementBadge.unlockedLabel': string;

  // Session share card
  'share.totalScore': string;
  'share.arrowsShot': string;
  'share.withScoring': string;
  'share.withoutScoring': string;
  'share.trainingSession': string;
  'share.date': string;
  'share.category': string;
  'share.bow': string;
  'share.distance': string;
  'share.environment': string;
  'share.location': string;

  // Session share modal
  'shareModal.title': string;
  'shareModal.hint': string;
  'shareModal.copy': string;
  'shareModal.copying': string;
  'shareModal.copied': string;
  'shareModal.download': string;
  'shareModal.downloading': string;
  'shareModal.copyFallback': string;
  'shareModal.copyError': string;
  'shareModal.downloadError': string;

  // Bow form
  'bowForm.nameLabel': string;
  'bowForm.typeLabel': string;
  'bowForm.favoriteLabel': string;
  'bowForm.favoriteHelp': string;
  'bowForm.sightMarkSection': string;
  'bowForm.eyeToNock': string;
  'bowForm.eyeToSight': string;
  'bowForm.aimMeasure': string;
  'bowForm.aimMeasureTooltip': string;
  'bowForm.advancedSection': string;
  'bowForm.limbs': string;
  'bowForm.riser': string;
  'bowForm.hand': string;
  'bowForm.handSelect': string;
  'bowForm.handRight': string;
  'bowForm.handLeft': string;
  'bowForm.drawWeight': string;
  'bowForm.bowLength': string;
  'bowForm.braceHeight': string;
  'bowForm.stup': string;
  'bowForm.tiller': string;
  'bowForm.notes': string;
  'bowForm.notesHelp': string;

  // Arrows form
  'arrowsForm.nameLabel': string;
  'arrowsForm.materialLabel': string;
  'arrowsForm.arrowsCount': string;
  'arrowsForm.favoriteLabel': string;
  'arrowsForm.favoriteHelp': string;
  'arrowsForm.advancedSection': string;
  'arrowsForm.diameter': string;
  'arrowsForm.length': string;
  'arrowsForm.weight': string;
  'arrowsForm.spine': string;
  'arrowsForm.pointType': string;
  'arrowsForm.pointWeight': string;
  'arrowsForm.vanes': string;
  'arrowsForm.nock': string;
  'arrowsForm.notes': string;
  'arrowsForm.notesHelp': string;
  'arrowsForm.nameRequired': string;

  // Stats summary
  'statsSummary.totalArrows': string;
  'statsSummary.withScore': string;
  'statsSummary.withoutScore': string;
  'statsSummary.overall': string;
  'statsSummary.last30days': string;
  'statsSummary.last7days': string;
  'statsSummary.ariaLabel': string;
  'statsSummary.periods': string;

  // Bueboka 2.0 announcement section
  'bueboka2.badge': string;
  'bueboka2.titlePrefix': string;
  'bueboka2.subtitle': string;
  'bueboka2.feature1Title': string;
  'bueboka2.feature1Text': string;
  'bueboka2.feature2Title': string;
  'bueboka2.feature2Text': string;
  'bueboka2.feature3Title': string;
  'bueboka2.feature3Text': string;
  'bueboka2.upgradeTitle': string;
  'bueboka2.upgradeTextPart1': string;
  'bueboka2.upgradeDate': string;
  'bueboka2.upgradeTextPart2': string;
  'bueboka2.warningTitle': string;
  'bueboka2.warningText': string;
  'bueboka2.ctaPrimary': string;

  // Social media section
  'social.title': string;
  'social.subtitle': string;
  'social.facebookAriaLabel': string;
  'social.facebookText': string;
  'social.facebookCta': string;
  'social.huddAriaLabel': string;
  'social.huddText': string;
  'social.huddCta': string;

  // Contributors section
  'contributors.title': string;
  'contributors.subtitle': string;
  'contributors.visitWebsite': string;
  'contributors.openNewTab': string;
  'contributors.profileImageAlt': string;
  'contributors.initialsLabel': string;
  'contributors.roleProjectLeadDeveloper': string;
  'contributors.roleDeveloperArcher': string;
  'contributors.roleUxDesigner': string;

  // Sponsor / support section
  'sponsor.title': string;
  'sponsor.subtitle': string;
  'sponsor.vippsTitle': string;
  'sponsor.vippsDesc': string;
  'sponsor.vippsLabel': string;
  'sponsor.vippsQrAlt': string;
  'sponsor.businessTitle': string;
  'sponsor.businessDesc': string;
  'sponsor.sponsorButton': string;
}
