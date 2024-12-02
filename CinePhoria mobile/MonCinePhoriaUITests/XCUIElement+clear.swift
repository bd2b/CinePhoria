//
//	XCUIElement+clear.swift
//	MonCinePhoriaUITests
//
//  Cree par Bruno DELEBARRE-DEBAY on 02/12/2024.
//  bd2db
//


import Foundation
import XCTest

/// Fonction permettant d'éffacer un TextField afant de le saisir
extension XCUIElement {
    func clear() {
        guard let stringValue = self.value as? String else {
            XCTFail("Failed to clear text in XCUIElement.")
            return
        }

        let deleteString = String(repeating: XCUIKeyboardKey.delete.rawValue, count: stringValue.count)
                tap()
                typeText(deleteString) // Saisit la chaîne pour supprimer le contenu
    }
}
