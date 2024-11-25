//
//	EvaluationView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 25/11/2024.
//  bd2db
//


import SwiftUI

struct EvaluationView: View {
    
    @State private var sliderValue: Double = 2.5 // Valeur par défaut du slider
    @State private var userInput: String = "" // Texte saisi par l'utilisateur
    
    var body: some View {
        VStack(spacing: 30) {
            // Titre
            Text("Comment avez-vous trouver ce film ?")
                .font(.largeTitle)
                .bold()
                .padding()
            
            // Slider gradué
            VStack {
                Text("Note : \(sliderValue, specifier: "%.1f")")
                    .font(.title3)
                Slider(value: $sliderValue, in: 0...5, step: 0.5)
                    .padding(.horizontal)
            }
            
            // Zone de saisie de texte
            VStack(alignment: .leading, spacing: 10) {
                Text("Donnez nous votre avis")
                    .font(.title3)
                
                TextEditor(text: $userInput)
                    .frame(height: 150)
                    .border(Color.gray, width: 1)
                    .cornerRadius(8)
                    .padding(.horizontal)
                    .keyboardType(.default) // Permet d'afficher le clavier complet
            }
            
            Spacer()
        }
        .padding()
    }
}


#Preview {
    EvaluationView()
}
