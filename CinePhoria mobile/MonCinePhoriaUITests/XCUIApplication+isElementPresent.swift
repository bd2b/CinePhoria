//
//	XCUIApplication+isLabelPresent.swift
//	MonCinePhoriaUITests
//
//  Cree par Bruno DELEBARRE-DEBAY on 03/12/2024.
//  bd2db
//


import Foundation
import XCTest

extension XCUIApplication {
    /// Vérifie si un élément spécifique correspondant à une expression régulière est présent dans l'application.
    /// - Parameters:
    ///   - regex: L'expression régulière à vérifier contre le label de l'élément.
    ///   - elementType: Le type d'élément (`XCUIElementQuery`) à rechercher (par exemple `staticTexts`, `images`, `buttons`).
    /// - Returns: Un booléen indiquant si un élément correspondant existe.
    func isElementPresent(regex: String, elementType: XCUIElementQuery) -> Bool {
        let predicate = NSPredicate(format: "label MATCHES %@", regex)
        return elementType.matching(predicate).firstMatch.exists
    }
    
    /// Vérifie si un élément spécifique correspondant à un label est présent dans l'application.
    /// - Parameters:
    ///   - label: Le label de l'élément.
    ///   - elementType: Le type d'élément (`XCUIElementQuery`) à rechercher (par exemple `staticTexts`, `images`, `buttons`).
    /// - Returns: Un booléen indiquant si un élément correspondant existe.
    func isElementPresent(label: String, elementType: XCUIElementQuery) -> Bool {
        let predicate = NSPredicate(format: "label == %@", label)
        return elementType.matching(predicate).firstMatch.exists
    }
    
    /// Retourne un élément spécifique avec un label vérifiant une expression régulière.
    /// - Parameters:
    ///   - regex: L'expression régulière à vérifier contre le label de l'élément.
    ///   - elementType: Le type d'élément (`XCUIElementQuery`) à rechercher.
    /// - Returns: L'élément trouvé.
    func element(regex: String, elementType: XCUIElementQuery) -> XCUIElement {
        let predicate = NSPredicate(format: "label MATCHES %@", regex)
        return elementType.matching(predicate).firstMatch
    }
    
    /// Retourne un élément spécifique avec un label.
    /// - Parameters:
    ///   - label: Le label de l'élément.
    ///   - elementType: Le type d'élément (`XCUIElementQuery`) à rechercher.
    /// - Returns: L'élément trouvé.
    func element(label: String, elementType: XCUIElementQuery) -> XCUIElement {
        let predicate = NSPredicate(format: "label == %@", label)
        return elementType.matching(predicate).firstMatch
    }
}
