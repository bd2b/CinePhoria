//
//    CustomFont.swift
//    CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import Foundation

import SwiftUI
import AppKit

/// Retourne une police personnalisée compatible avec les styles dynamiques macOS.
/// - Parameters:
///   - style: Le style dynamique de la police (ex: .title, .body).
///   - fontName: Le nom de la police personnalisée.
/// - Returns: Une police `Font` adaptée.
func customFont(style: Font.TextStyle, fontName: String = "Actor-Regular") -> Font {
    let size = fontSize(for: style)
    return Font.custom(fontName, size: size)
}

/// Retourne une taille de police raisonnable selon le style SwiftUI sous macOS.
private func fontSize(for style: Font.TextStyle) -> CGFloat {
    switch style {
    case .largeTitle: return 34
    case .title: return 28
    case .title2: return 22
    case .title3: return 20
    case .headline: return 17
    case .subheadline: return 15
    case .body: return 17
    case .callout: return 16
    case .footnote: return 13
    case .caption: return 12
    case .caption2: return 11
    @unknown default: return 17
    }
}
