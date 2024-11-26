//
//	EvaluationView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 25/11/2024.
//  bd2db
//


import SwiftUI

struct EvaluationView: View {
    var reservation: Reservation
    var isNewEvaluation: Bool
    var isDeletingEvaluation: Bool = false
    
    @State private var sliderValue: Double = 2.5
    @State private var userInput: String = "" // Texte saisi par l'utilisateur
    @Environment(\.dismiss) private var dismiss
    
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
            
            HStack {
                Button(action: submit) {
                Label("Valider", systemImage: "checkmark")
                    .padding(10)
                    .font(.title)
                }
                .buttonStyle(.borderedProminent)
                .buttonBorderShape(.circle)
                .frame(width: 100)
                
                Button(action: eraseEvaluation) {
                    Label("Submit", systemImage: "trash")
                        .padding(10)
                        .font(.title)
                }
                .buttonStyle(.borderedProminent)
                .buttonBorderShape(.circle)
                .frame(width: 100)
                .disabled(isNewEvaluation)
            }
        }
        .onAppear() {
            if !isNewEvaluation {
                if let note = reservation.note {
                    sliderValue = note
                }
                if let evaluation = reservation.evaluation {
                    userInput = evaluation
                }
            }
        }
        .padding()
    }
    func eraseEvaluation() {
        reservation.evaluation = nil
        reservation.note = nil
        
        dismiss()
    }
    func submit() {
        reservation.evaluation = userInput
        reservation.note = sliderValue
        
        dismiss()
    }
}


#Preview {
    EvaluationView(reservation: Reservation.samplesReservation[1], isNewEvaluation:  true)
}

#Preview {
    EvaluationView(reservation: Reservation.samplesReservation[2], isNewEvaluation:  false)
}

#Preview {
    EvaluationView(reservation: Reservation.samplesReservation[3], isNewEvaluation:  false)
}
