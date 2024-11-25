//
//	QRCodeView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 25/11/2024.
//  bd2db
//


import SwiftUI
import UIKit

struct QRCodeView: View {
    @State private var originalBrightness: CGFloat = UIScreen.main.brightness
    var body: some View {
        VStack {
            Text("Votre QR Code")
            Image(.qrCode)
                .resizable()
                .scaledToFit()
        }
        .onAppear() {
            setBrightness(to: 0.8)
        }
        .onDisappear() {
            restoreBrightness()
        }
            
    }
    private func setBrightness(to value: CGFloat) {
            originalBrightness = UIScreen.main.brightness
            UIScreen.main.brightness = value
        }

        private func restoreBrightness() {
            UIScreen.main.brightness = originalBrightness
        }
}

#Preview {
    QRCodeView()
}
