//
//	CustomFont.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//


import Foundation
import SwiftUI

/// Retourne une police personnalisée compatible avec les styles dynamiques et les graisses.
/// - Parameters:
///   - style: Le style dynamique de la police (ex: .title, .body).
///   - fontName: Le nom de la police personnalisée.
/// - Returns: Une police `Font` adaptée.
func customFont(style: Font.TextStyle, fontName: String = "Actor-Regular") -> Font {
    // Obtenez la taille dynamique en fonction du style
    let size = UIFont.preferredFont(forTextStyle: UIFont.TextStyle(style)).pointSize
    
    // Retournez la police
    return Font.custom(fontName, size: size )
}

// Extension pour mapper Font.TextStyle à UIFont.TextStyle
extension UIFont.TextStyle {
    init(_ style: Font.TextStyle) {
        switch style {
        case .largeTitle: self = .largeTitle
        case .title: self = .title1
        case .title2: self = .title2
        case .title3: self = .title3
        case .headline: self = .headline
        case .subheadline: self = .subheadline
        case .body: self = .body
        case .callout: self = .callout
        case .footnote: self = .footnote
        case .caption: self = .caption1
        case .caption2: self = .caption2
        @unknown default: self = .body
        }
    }
}
