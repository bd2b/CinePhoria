//
//	WelcomeScreenView.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import Foundation


import SwiftUI
// import Giffy


struct WelcomeScreenView: View {
    @Binding var showWelcomeScreen: Bool

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            // Titre principal
            VStack(spacing: 8) {
                Text("Support Cinephoria")
                    .font(customFont(style: .largeTitle))
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Image("IconeApplication")
                    .resizable()
                        .frame(width: 128, height: 128)
     
            }
            .padding()

            // Section des items
            VStack(alignment: .leading, spacing: 20) {
                WelcomeItemView(
                    imageName: "magnifyingglass",
                    title: "Visualisez les incidents",
                    description: "Selon les cinémas ou vous intervenez, vous trouvez les incidents en cours et organisés par salle."
                )

                WelcomeItemView(
                    imageName: "plus.app.fill",
                    title: "Creer de nouveaux incidents",
                    description: "Selectionnez une salle et cliquez sur le bouton PLUS pour ajouter de nouveaux incidents. SI vous vous trompez alors que l'incident est toujours a l'état Nouveau, vous pouvez supprimez cet incident."
                )

                WelcomeItemView(
                    imageName: "slider.horizontal.2.square.on.square",
                    title: "Suivez la résolution des incidents",
                    description: "Lorsque l'incident est résolu, la date de résolution est mémorisée et il reste visible sans modification possible dans la liste des incidents de la salle concernée."
                )
            }
            .padding(.horizontal)

            Spacer()

            // Bouton de démarrage
            Button(action: {
                UserDefaults.standard.hasSeenWelcomeScreen = true
                showWelcomeScreen = false
            }) {
                Text("C'est parti !")
                    .font(customFont(style: .title2))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding()
            }
            .buttonStyle(PlainButtonStyle()) // important pour macOS
            .background(.doreAccentuation)   // fond sur le bouton complet
            .foregroundColor(.white)
            .cornerRadius(10)
            .padding(.horizontal, 20)
        }
        .padding(.bottom,20)
        .background(Color.black.edgesIgnoringSafeArea(.all))
    }
}

struct WelcomeItemView: View {
    let imageName: String
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: 15) {
            Image(systemName: imageName)
                .font(.title)
                .foregroundColor(.doreAccentuation)
                .frame(width: 40, height: 40)
            
            VStack(alignment: .leading, spacing: 5) {
                Text(title)
                    .font(customFont(style: .headline))
                    .foregroundColor(.white)
                Text(description)
                    .font(customFont(style: .subheadline))
                    .foregroundColor(.gray)
            }
        }
    }
}

#Preview {
    WelcomeScreenView(showWelcomeScreen: .constant(true))
}

