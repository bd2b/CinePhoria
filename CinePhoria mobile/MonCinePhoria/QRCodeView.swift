//
//    QRCodeView.swift
//    MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 25/11/2024.
//  bd2db
//


import SwiftUI
import UIKit

struct QRCodeView: View {
    @State private var originalBrightness: CGFloat = UIScreen.main.brightness
    var qrCodeImage: UIImage?
    var reservation: Reservation
    var isPromoFriandise: Bool = true
    var numberSeatsRestingBeforPromoFriandise: Int?
    var promoFriandiseDiscount: Double
    
    var qrImage: Image? {
        if let qrCodeImage {
            return Image(uiImage: qrCodeImage)
        }
        return nil
    }
    
    var body: some View {
        VStack {
            Text("Votre QR Code")
                .font(customFont(style: .largeTitle))
            if let qrImage = qrImage {
                qrImage
                    .resizable()
                    .scaledToFit()
            } else {
                ProgressView("Chargement du QR Code...")
            }
            // Message d'incentive
            if isPromoFriandise {
                // Si c'est une réservation promo
                BouncingView(promoFriandiseDiscount: promoFriandiseDiscount)
            } else if let remaining = numberSeatsRestingBeforPromoFriandise {
                // Si ce n’est pas une réservation promo
                Text("Encore \(remaining) places à réserver pour obtenir votre réduction de \(String(promoFriandiseDiscount)) € 🎁 !")
                    .font(customFont(style: .headline))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .padding(50)
            }
            
            Spacer()
        }
        .onAppear() {
            setBrightness(to: 0.8)
        }
        .onDisappear() {
            restoreBrightness()
        }
        .background(Color.black.opacity(0.8))
            
    }
    private func setBrightness(to value: CGFloat) {
            originalBrightness = UIScreen.main.brightness
            UIScreen.main.brightness = value
        }

        private func restoreBrightness() {
            UIScreen.main.brightness = originalBrightness
        }
}



struct BouncingView: View {
    @State private var offset: CGFloat = UIScreen.main.bounds.height // Position initiale hors écran
    @State private var damping: CGFloat = 0.5
    var promoFriandiseDiscount: Double = 5.0

    var body: some View {
        VStack {
            Spacer()
            
            // Vue animée (par exemple, message de félicitations)
            VStack(spacing: 20) {
                Text("🎉 Félicitations ! 🎉")
                    .font(customFont(style: .largeTitle))
                    .foregroundColor(.yellow)
                
                Text("Utilisez ce QR Code pour bénéficier de la réduction de \(String(promoFriandiseDiscount)) € sur les friandises !")
                    .font(customFont(style: .headline))
                    .multilineTextAlignment(.center)
                    .foregroundColor(.white)
                    .padding(.horizontal)
                
                
                    
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 30)
            .padding(.horizontal, 10)
            .background(Color.gray.opacity(0.2))
            .cornerRadius(20)
            .offset(y: offset) // Dépend de l'état de l'animation
            .onAppear {
                // Animation corrigée avec un amortissement doux
                withAnimation(
                    .interpolatingSpring(stiffness: 200, damping: 20) // Réduit le rebond
                ) {
                    offset = 0 // Amener à l'écran
                }
            }
        }
        .padding(.bottom, 50)
        .padding(.horizontal, 20)
        .edgesIgnoringSafeArea(.bottom)
        .background(Color.black.opacity(0.8))
    }
}

//#Preview {
//    QRCodeView(promoFriandiseDiscount: 5.0)
//}
