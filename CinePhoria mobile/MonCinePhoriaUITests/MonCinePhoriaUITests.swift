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
        
        var featureToVerify: [String : Bool] = [
            "AffichageCoupDeCoeur" : false ,
            "AffichageQRCode" : false ,
            "AffichageEvaluation" : false,
            "AffichageEvaluationRealisee" : false
        ]
        
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
            try verifyCardsReservationView(app: app)
            
            // Localiser le PageIndicator
            let pageIndicator = app.pageIndicators.firstMatch
            XCTAssertTrue(pageIndicator.exists, "Le PageIndicator est absent.")
            
            // Extraire le nombre total de pages depuis la valeur du PageIndicator
            guard let pageValue = pageIndicator.value as? String,
                  let totalPages = Int(pageValue.components(separatedBy: " of ").last ?? "0") else {
                XCTFail("Impossible de déterminer le nombre total de pages.")
                return
            }
            
            // Boucler sur chaque page
            for currentPage in 1...totalPages {
                // Vérifier que la page actuelle est correcte
                XCTAssertEqual(pageIndicator.value as? String, "page \(currentPage) of \(totalPages)", "La page actuelle n'est pas correcte.")
                
                // Imprimer la hiérarchie pour debug (optionnel)
                print("--------- Page \(currentPage) ---------")
                print(app.debugDescription)
                print("-------------------------------------")
                
                // Vérificatio de la page
                // Accéder à la vue FilmView
                app.images["ReservationImage"].firstMatch.tap()
                
                // Vérifier que SeanceView est bien affichée et retour
                try verifyFilmView(app: app)
                
                // Accéder à la vue SeanceView, on prend n'importe quel controle de SeanceView et on tap dessus
                app.staticTexts["SeanceView"].firstMatch.tap()
                
                // Vérifier que SeanceView est bien affichée et retour
                try verifySeanceView(app: app)
                
                if app.isElementPresent(label: "QRCode à présenter à votre entrée", elementType: app.staticTexts) {
                    print("QRCode à présenter à votre entrée")
                    app.element(label: "QRCode à présenter à votre entrée", elementType: app.staticTexts).tap()
                    try verifyQRCodeView(app: app)
                    featureToVerify["AffichageQRCode"] = true
                }
                
                if app.isElementPresent(label: "Donnez nous votre avis !", elementType: app.staticTexts) {
                    print("Donnez nous votre avis")
                    app.element(label: "Donnez nous votre avis !", elementType: app.staticTexts).tap()
                    try verifyEvaluationView(app: app)
                    featureToVerify["AffichageEvaluation"] = true
                }
                
                if app.isElementPresent(label: "Votre évaluation", elementType: app.staticTexts) {
                    print("Votre évaluation")
                    // app.element(label: "Votre évaluation", elementType: app.staticTexts).tap()
                    featureToVerify["AffichageEvaluationRealisee"] = true
                    
                }
                
                // Naviguer vers la page suivante (si ce n'est pas la dernière page)
                if currentPage < totalPages {
                    app.swipeLeft()
                }
            }
            // Vérification qu'on est passé dans toutes les composantes fonctionnelles
            // Filtrer les clés où la valeur est `false` et les concaténer
            let concatenatedKeys = featureToVerify
                .filter { !$0.value } // Garder seulement les paires avec une valeur false
                .map { $0.key }       // Extraire les clés
                .joined(separator: ", ") // Concaténer avec une virgule et un espace
            XCTAssertTrue(featureToVerify.reduce(true, { $0 && $1.value }), "On n'a pas testé : \(concatenatedKeys)")
        }
        
        
        
        func verifyCardsReservationView(app: XCUIApplication) throws {
            // On suppose etre sur la view CardsReservationView
            print("---------CardsReservationView")
            print(app.debugDescription)
            print("---------")
            
            // Vérifier que nous sommes sur la bonne vue
            XCTAssertTrue(app.staticTexts["Mes réservations"].exists, "Le titre 'Mes réservations' est absent.")
            
            XCTAssertTrue(app.images["ReservationImage"].exists, "Pas d'image de film")
            XCTAssertTrue(app.staticTexts["ReservationTitle"].exists, "Pas de titre de film")
            
            XCTAssertTrue(app.staticTexts["SeanceView"].firstMatch.exists, "Pas de vue SeanceView")
            
            XCTAssertTrue(app.staticTexts["ActionsView"].firstMatch.exists, "Pas de vue ActionsView")
            
        }
        
        func verifyFilmView(app: XCUIApplication) throws {
            // On suppose etre sur la Film View
            print("---------FilmView")
            print(app.debugDescription)
            print("---------")
            
            XCTAssertTrue(app.images["imageFilm"].exists, "Pas d'image")
            XCTAssertTrue(app.staticTexts["titreFilm"].exists, "Pas de titre")
            XCTAssertTrue(app.staticTexts["genre"].exists, "Pas de genre")
            XCTAssertTrue(app.staticTexts["categorie"].exists, "Pas de categorie")
            XCTAssertTrue(app.staticTexts["duration"].exists, "Pas de duration")
            XCTAssertTrue(app.staticTexts["note"].exists, "Pas de note")
            
            if app.staticTexts["coupDeCoeur"].exists {
                XCTAssertTrue(app.images["heart.fill"].exists || app.images["heart"].exists, "Pas d'icone Coup de coeur")
                featureToVerify["AffichageCoupDeCoeur"] = true
            }
            
            XCTAssertTrue(app.staticTexts["description"].exists, "Pas de description")
            XCTAssertTrue(app.staticTexts["author"].exists, "Pas de author")
            XCTAssertTrue(app.staticTexts["distribution"].exists, "Pas de distribution")
            
            app.swipeDown(velocity: .fast)
        }
        
        func verifySeanceView(app: XCUIApplication) throws {
            // On suppose etre sur la Seance View
            print("---------SeanceView")
            print(app.debugDescription)
            print("---------")
            
            XCTAssertTrue(app.staticTexts["Votre réservation"].exists, "Pas d'affichage de la modal des places SeatsView")
            XCTAssertTrue(app.staticTexts["TotalPrice"].exists, "Pas d'affichage du prix total SeatsView")
            
            app.buttons["checkmark"].tap()
        }
        
        func verifyQRCodeView(app: XCUIApplication) throws {
            // On suppose etre sur la modal QRCode View
            print("---------QRCodeView")
            print(app.debugDescription)
            print("---------")
            
            XCTAssertTrue(app.isElementPresent(label: "Votre QR Code", elementType: app.staticTexts), "Pas d'affichage de la modal QRCode")
            
            XCTAssertTrue(app.isElementPresent(label: "QRCode", elementType: app.images), "Pas d'affichage de l'image QRCode")
            
            let isPromoReservationPresente = app.isElementPresent(label: "🎉 Félicitations ! 🎉", elementType: app.staticTexts) || app.isElementPresent(regex: #"Encore \d+ places à réserver pour obtenir votre réduction de \d+ € 🎁 !"#, elementType: app.staticTexts)
            
            XCTAssertTrue(isPromoReservationPresente, "Pas d'affichage de la promo")
            
            app.swipeDown(velocity: .fast)
        }
        
        func verifyEvaluationView(app: XCUIApplication) throws {
            var newNote: Double = 0.0
            var newEvaluation: String = ""
            
            // On suppose etre sur la modal Evaluation View
            print("---------AvaluationView")
            print(app.debugDescription)
            print("---------")
            
            XCTAssertTrue(app.isElementPresent(label: "Comment avez-vous trouver ce film ?", elementType: app.staticTexts), "Pas d'affichage de la modal Evaluation")
            XCTAssertTrue(app.isElementPresent(regex: #"Note : (\d+[,.]\d+)"#, elementType: app.staticTexts), "Pas d'affichage de la note")
            
            // Localiser le slider
            let slider = app.sliders.firstMatch
            XCTAssertTrue(slider.exists, "Le slider est absent.")
            
            // Lire la valeur actuelle
            if let currentValue = slider.value as? String {
                print("Valeur actuelle du slider : \(currentValue)")
            }
            
            // Générer une position aléatoire normalisée
            let randomPosition = CGFloat.random(in: 0.0...1.0)
            print("Nouvelle position aléatoire pour le slider : \(randomPosition)")
            
            // Définir une nouvelle position
            slider.adjust(toNormalizedSliderPosition: randomPosition) // Position à 75% de la plage
            
            // Vérifier que la nouvelle valeur est bien entrée
            if let updatedValue = slider.value as? String {
                newNote = Double(updatedValue) ?? 0.0
                print("Nouvelle valeur du slider après ajustement : \(updatedValue)")
                
            }
            
            XCTAssertTrue(app.isElementPresent(label: "Donnez nous votre avis", elementType: app.staticTexts), "Pas de label 'Donnez nous votre avis")
            
            let textView = app.textViews.firstMatch
            XCTAssertTrue(textView.exists, "La TextView est absente.")
            
            // Effacer le contenu
            textView.clear()
            
            // Saisir une valeur aléatoire dans la TextView
            let randomValue = "Valeur aléatoire : \(Int.random(in: 1000...9999))"
            textView.typeText(randomValue)
            newEvaluation = randomValue
            
            // Vérifier que la nouvelle valeur est bien entrée
            XCTAssertEqual(textView.value as? String, randomValue, "La TextView n'a pas été mise à jour correctement.")
            
            
            
            app.swipeDown(velocity: .fast)
            
            // On va vérifier que les valeur ont bien été enregistrer
            
            // Verifier que les valeurs ont bien été sauvegardées
            print("---------Apres Evaluation")
            print(app.debugDescription)
            print("---------")
            guard app.isElementPresent(label: "Votre évaluation", elementType: app.staticTexts) else {
                XCTFail("Pas de restitution de la note et l'évaluation enregistrées dans les tests")
                return
            }
            //   app.element(label: "Votre évaluation", elementType: app.staticTexts).tap()
            print("---------Apres Evaluation")
            print(app.debugDescription)
            print("---------")
            
            let elementNote = app.element(regex: #"Note : (\d+[,.]\d+)"#, elementType: app.staticTexts)
            
            // Obtenir la valeur du label
            let labelText = elementNote.label
            // Expression régulière pour extraire la note
            let pattern = #"Note: (\d+(\.\d+)?)"#
            let regex = try! NSRegularExpression(pattern: pattern)
            let range = NSRange(location: 0, length: labelText.utf16.count)
            
            if let match = regex.firstMatch(in: labelText, options: [], range: range),
               let noteRange = Range(match.range(at: 1), in: labelText) {
                let extractedNote = String(labelText[noteRange])
                print("Note extraite : \(extractedNote)")
                if newNote != Double(extractedNote) {
                    XCTFail("La note extraite \(String(newNote)) n'est pas la même que la note saisie \(String(extractedNote)).")
                }
            } else {
                XCTFail("Impossible d'extraire la note du label.")
            }
        }
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
