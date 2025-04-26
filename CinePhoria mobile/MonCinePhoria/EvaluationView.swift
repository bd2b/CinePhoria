//
//	EvaluationView.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 25/11/2024.
//  bd2db
//


import SwiftUI

struct EvaluationView: View {

    @Bindable var dataController: DataController
    var currentPage: Int
    var isNewEvaluation: Bool
    var isDeletingEvaluation: Bool = false
    

    
    @State private var sliderValue: Double = 2.5
    @State private var userInput: String = "" // Texte saisi par l'utilisateur
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(spacing: 30) {
            // Titre
            Text("Comment avez-vous trouver ce film ?")
                .font(customFont(style: .largeTitle))
                .bold()
                .padding()
            
            // Slider gradué
            VStack {
                Text("Note: \(String(format: "%.1f", sliderValue))")
                    .font(customFont(style: .title3))
                Slider(value: $sliderValue, in: 0...5, step: 0.5)
                    .padding(.horizontal)
            }
            
            // Zone de saisie de texte
            VStack(alignment: .leading, spacing: 10) {
                Text("Donnez nous votre avis")
                    .font(customFont(style: .title3))
                
                TextEditor(text: $userInput)
                    .font(customFont(style: .body))
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
            if let sliderValue = dataController.reservations[currentPage].note {
                self.sliderValue = sliderValue
            }
            if let userInput = dataController.reservations[currentPage].evaluation {
                self.userInput = userInput
            }
      }
        .padding()
    }
    func eraseEvaluation() {
        dataController.reservations[currentPage].evaluation = nil
        dataController.reservations[currentPage].note = nil
        
        dismiss()
    }
    func submit() {
        dataController.reservations[currentPage].evaluation = userInput
        dataController.reservations[currentPage].note = sliderValue
        
        dismiss()
    }
}


#Preview {
    @Previewable @State var dataController = DataController()
    EvaluationView(dataController: dataController, currentPage: 0, isNewEvaluation: true)
}

#Preview {
    @Previewable @State var dataController = DataController()
    EvaluationView(dataController: dataController, currentPage: 1, isNewEvaluation: false)
}
#Preview {
    @Previewable @State var dataController = DataController()
    EvaluationView(dataController: dataController, currentPage: 2, isNewEvaluation: false)
    
}
