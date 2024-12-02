//
//	MonCinePhoriaUITests.swift
//	MonCinePhoriaUITests
//
//  Cree par Bruno DELEBARRE-DEBAY on 02/12/2024.
//  bd2db
//


import XCTest

final class MonCinePhoriaUITests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.

        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    @MainActor
    func testLoginView() throws {
        // UI tests must launch the application that they test.
        let app = XCUIApplication()
        app.launchArguments = ["enable-testing"]
        app.launch()
        if app.buttons["Se connecter"].exists {
            XCTAssertTrue(app.textFields["Votre email"].exists, "Champ login non présent")
            XCTAssertTrue(app.secureTextFields["Mot de passe"].exists, "Champ mot de passe non présent")
            XCTAssertTrue(app.switches["RememberMeToggle"].exists  ,  "Slider se souvenir de moi non présent")
            XCTAssertTrue(app.buttons["Mot de passe oublié ?"].exists, "CTA Mot de passe oublié absent")
        }

        // Use XCTAssert and related functions to verify your tests produce the correct results.
    }
    
    @MainActor
    func testLogin() throws {
        // Test de login sur l'application
        let app = XCUIApplication()
        app.launchArguments = ["enable-testing"]
        app.launch()
        if app.buttons["Se connecter"].exists {
            XCTAssertTrue(app.textFields["Votre email"].exists, "Champ login non présent")
            XCTAssertTrue(app.secureTextFields["Mot de passe"].exists, "Champ mot de passe non présent")
            
            app.textFields["Votre email"].clear()
            app.typeText("admin")
            app.secureTextFields["Mot de passe"].clear()
            app.typeText("password")
            
            app.buttons["Se connecter"].tap()
            
            // Attendre que la ProgressView disparaisse
            let expectation = XCTNSPredicateExpectation(
                predicate: NSPredicate(format: "exists == false"),
                object: app.activityIndicators["ProgressView"]
            )
            let result = XCTWaiter().wait(for: [expectation], timeout: 10)
            XCTAssertEqual(result, .completed, "La ProgressView ne s'est pas fermée à temps.")
            
            // Vérifier que la CardsReservationView est bien affichée
          //  try verifyCardsReservationView(app: app)
            // Vérifier que nous sommes sur la bonne vue
            XCTAssertTrue(app.staticTexts["Mes réservations"].exists, "Le titre 'Mes réservations' est absent.")
            
            // Accéder à la première carte
                let firstCard = app.otherElements["CardReservationView0"]
                XCTAssertTrue(firstCard.exists, "La première carte de réservation est absente.")
                XCTAssertTrue(firstCard.isHittable, "La première carte de réservation n'est pas accessible.")
            
//            
//            
//            // Vérifier que l'application a bien lancé la TabView
//            let tabView = app.tabBars["MainTabView"]
//                let exists = tabView.waitForExistence(timeout: 5)
//                XCTAssertTrue(exists, "La TabView est absente ou n'a pas été chargée à temps.")
//            
//            // Attendre que la TabView devienne visible
//                let tabView2 = app.tabBars.firstMatch
//                XCTAssertTrue(tabView2.exists, "La TabView est absente.")
//            
//            // Accéder à la première réservation dans la ScrollView
//                let firstReservation = app.scrollViews.firstMatch
//                XCTAssertTrue(firstReservation.exists, "La première réservation est absente ou non accessible.")
//            
//            // S'assurer que la ScrollView est visible
//                XCTAssertTrue(firstReservation.isHittable, "La première réservation n'est pas visible à l'écran.")
//            
//            // Vérifier que l'image de la réservation est présente
//            let reservationImage = firstReservation.images["ReservationImage"]
//            XCTAssertTrue(reservationImage.exists, "L'image de la réservation est absente.")
//            XCTAssertTrue(reservationImage.isHittable, "L'image de la réservation n'est pas accessible.")
//            
//            // Vérifier que le titre de la réservation est présent
//            let reservationTitle = firstReservation.staticTexts["ReservationTitle"]
//            XCTAssertTrue(reservationTitle.exists, "Le titre de la réservation est absent.")
//            
//            // Vérifier que la vue de la séance est présente
//            let seanceView = firstReservation.otherElements["SeanceView"]
//            XCTAssertTrue(seanceView.exists, "La vue de la séance est absente.")
//            
//            // Vérifier que la vue des actions est présente
//            let actionsView = firstReservation.otherElements["ActionsView"]
//            XCTAssertTrue(actionsView.exists, "La vue des actions est absente.")
//            
//            // Vérifier qu'il y a une TabView (carte principale)
//            XCTAssertTrue(app.tabBars.firstMatch.exists, "La TabView est absente.")
        }

    }
    
    func verifyCardsReservationView(app: XCUIApplication) throws {
        // On suppose etre sur la view CardsReservationView
        
        // Vérifier que nous sommes sur la bonne vue
        XCTAssertTrue(app.staticTexts["Mes réservations"].exists, "Le titre 'Mes réservations' est absent.")
        
        // Accéder à la première réservation dans la TabView
        let firstReservation = app.scrollViews.firstMatch
        
        // Vérifier que l'image de la réservation est présente
        let reservationImage = firstReservation.images["ReservationImage"]
        XCTAssertTrue(reservationImage.exists, "L'image de la réservation est absente.")
        
        // Vérifier que le titre de la réservation est présent
        let reservationTitle = firstReservation.staticTexts["ReservationTitle"]
        XCTAssertTrue(reservationTitle.exists, "Le titre de la réservation est absent.")
        
        // Vérifier que la vue de la séance est présente
        let seanceView = firstReservation.otherElements["SeanceView"]
        XCTAssertTrue(seanceView.exists, "La vue de la séance est absente.")
        
        // Vérifier que la vue des actions est présente
        let actionsView = firstReservation.otherElements["ActionsView"]
        XCTAssertTrue(actionsView.exists, "La vue des actions est absente.")
        
        // Vérifier qu'il y a une TabView (carte principale)
        XCTAssertTrue(app.tabBars.firstMatch.exists, "La TabView est absente.")
    }
    

    @MainActor
    func testLaunchPerformance() throws {
        if #available(macOS 10.15, iOS 13.0, tvOS 13.0, watchOS 7.0, *) {
            // This measures how long it takes to launch your application.
            measure(metrics: [XCTApplicationLaunchMetric()]) {
                XCUIApplication().launch()
            }
        }
    }
}
