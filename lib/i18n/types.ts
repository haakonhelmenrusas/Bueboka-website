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

  // Practice category options (used in the practice/competition form Category select)
  'practiceCategory.skiveIndoor': string;
  'practiceCategory.skiveOutdoor': string;
  'practiceCategory.jakt3D': string;
  'practiceCategory.felt': string;

  // Environment options (used in the practice/competition form Environment select)
  'environment.indoor': string;
  'environment.outdoor': string;

  // Weather chip / select labels
  'weather.sun': string;
  'weather.clouded': string;
  'weather.clear': string;
  'weather.rain': string;
  'weather.wind': string;
  'weather.snow': string;
  'weather.fog': string;
  'weather.thunder': string;
  'weather.changing': string;
  'weather.other': string;

  // Practice form step indicator + navigation
  'practiceStep.info': string;
  'practiceStep.rounds': string;
  'practiceStep.scoring': string;
  'practiceStep.reflection': string;
  'practice.stepGoTo': string;

  // Competition form step indicator
  'competitionStep.info': string;
  'competitionStep.rounds': string;
  'competitionStep.result': string;
  'competitionStep.reflection': string;

  // Round summary fallback (when no distance/target chosen yet)
  'round.noDetails': string;

  // Target type labels (used in the rounds step Target select and round summary)
  'target.size40cm': string;
  'target.size40Triple': string;
  'target.size60cm': string;
  'target.size60Triple': string;
  'target.size80cm': string;
  'target.size80Centre6': string;
  'target.size122cm': string;
  'target.field20Triple': string;
  'target.field40': string;
  'target.field60': string;
  'target.field80': string;
  'target.bareMat': string;
  'target.historicNLIndoor': string;
  'target.other': string;

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
  'form.noneSelected': string;

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

  // Sponsing page
  'sponsingPage.title': string;
  'sponsingPage.subtitle': string;
  'sponsingPage.ctaTitle': string;
  'sponsingPage.ctaSubtitle1': string;
  'sponsingPage.ctaSubtitle2': string;

  // Sight marks print/share modal
  'sightMarksPrintModal.title': string;
  'sightMarksPrintModal.hint': string;
  'sightMarksPrintModal.copy': string;
  'sightMarksPrintModal.copying': string;
  'sightMarksPrintModal.copied': string;
  'sightMarksPrintModal.download': string;
  'sightMarksPrintModal.downloading': string;
  'sightMarksPrintModal.downloadError': string;
  'sightMarksPrintModal.copyFallback': string;
  'sightMarksPrintModal.copyError': string;

  // Sight marks print card
  'sightMarksPrintCard.headerBadge': string;
  'sightMarksPrintCard.calibration': string;
  'sightMarksPrintCard.distance': string;

  // Calculate marks modal
  'calculateMarksModal.title': string;
  'calculateMarksModal.distanceRange': string;
  'calculateMarksModal.fromDistance': string;
  'calculateMarksModal.toDistance': string;
  'calculateMarksModal.interval': string;
  'calculateMarksModal.hillAngle': string;
  'calculateMarksModal.hillAngleHint': string;
  'calculateMarksModal.flatGround': string;
  'calculateMarksModal.angle': string;
  'calculateMarksModal.calculate': string;
  'calculateMarksModal.calculating': string;
  'calculateMarksModal.errorValueMissing': string;
  'calculateMarksModal.errorToGreaterThanFrom': string;
  'calculateMarksModal.errorNoBallisticsData': string;
  'calculateMarksModal.errorCalculate': string;
  'calculateMarksModal.errorSave': string;

  // Achievement badge
  'achievementBadge.unlocked': string;
  'achievementBadge.unlockedLabel': string;
  'achievementBadge.complete': string;

  // Achievement unlock modal
  'achievementUnlockModal.titleSingle': string;
  'achievementUnlockModal.titleMultiple': string;
  'achievementUnlockModal.subtitleSingle': string;
  'achievementUnlockModal.subtitleMultiple': string;
  'achievementUnlockModal.points': string;
  'achievementUnlockModal.totalPoints': string;
  'achievementUnlockModal.viewAll': string;

  // Achievement names and descriptions
  'achievement.first-practice.name': string;
  'achievement.first-practice.description': string;
  'achievement.practices-10.name': string;
  'achievement.practices-10.description': string;
  'achievement.practices-50.name': string;
  'achievement.practices-50.description': string;
  'achievement.practices-100.name': string;
  'achievement.practices-100.description': string;
  'achievement.practices-500.name': string;
  'achievement.practices-500.description': string;
  'achievement.streak-3.name': string;
  'achievement.streak-3.description': string;
  'achievement.streak-7.name': string;
  'achievement.streak-7.description': string;
  'achievement.streak-30.name': string;
  'achievement.streak-30.description': string;
  'achievement.streak-100.name': string;
  'achievement.streak-100.description': string;
  'achievement.arrows-1000.name': string;
  'achievement.arrows-1000.description': string;
  'achievement.arrows-5000.name': string;
  'achievement.arrows-5000.description': string;
  'achievement.arrows-10000.name': string;
  'achievement.arrows-10000.description': string;
  'achievement.arrows-50000.name': string;
  'achievement.arrows-50000.description': string;
  'achievement.perfect-end.name': string;
  'achievement.perfect-end.description': string;
  'achievement.big-session.name': string;
  'achievement.big-session.description': string;
  'achievement.first-competition.name': string;
  'achievement.first-competition.description': string;
  'achievement.competitions-10.name': string;
  'achievement.competitions-10.description': string;
  'achievement.competition-winner.name': string;
  'achievement.competition-winner.description': string;
  'achievement.all-categories.name': string;
  'achievement.all-categories.description': string;
  'achievement.indoor-specialist.name': string;
  'achievement.indoor-specialist.description': string;
  'achievement.outdoor-enthusiast.name': string;
  'achievement.outdoor-enthusiast.description': string;
  'achievement.3d-hunter.name': string;
  'achievement.3d-hunter.description': string;
  'achievement.field-archer.name': string;
  'achievement.field-archer.description': string;
  'achievement.bow-diversity.name': string;
  'achievement.bow-diversity.description': string;
  'achievement.bow-collector.name': string;
  'achievement.bow-collector.description': string;
  'achievement.master-of-all-bows.name': string;
  'achievement.master-of-all-bows.description': string;
  'achievement.recurve-rider.name': string;
  'achievement.recurve-rider.description': string;
  'achievement.compound-commander.name': string;
  'achievement.compound-commander.description': string;
  'achievement.longbow-legend.name': string;
  'achievement.longbow-legend.description': string;
  'achievement.barebow-archer.name': string;
  'achievement.barebow-archer.description': string;
  'achievement.horsebow-hero.name': string;
  'achievement.horsebow-hero.description': string;
  'achievement.traditionalist.name': string;
  'achievement.traditionalist.description': string;
  'achievement.recurve-dedicated.name': string;
  'achievement.recurve-dedicated.description': string;
  'achievement.compound-expert.name': string;
  'achievement.compound-expert.description': string;
  'achievement.longbow-master.name': string;
  'achievement.longbow-master.description': string;
  'achievement.weather-warrior.name': string;
  'achievement.weather-warrior.description': string;
  'achievement.early-bird.name': string;
  'achievement.early-bird.description': string;
  'achievement.night-owl.name': string;
  'achievement.night-owl.description': string;

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
