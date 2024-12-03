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
    

    
//    @State private var sliderValue: Double = 2.5
//    @State private var userInput: String = "" // Texte saisi par l'utilisateur
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
                Text("Note : \(String(format: "%.1f", dataController.reservations[currentPage].note ?? 2.5))")
                    .font(customFont(style: .title3))
                Slider(value: Binding(
                    get: { dataController.reservations[currentPage].note ?? 2.5 },
                    set: { dataController.reservations[currentPage].note = $0 }
                ), in: 0...5, step: 0.5)
                    .padding(.horizontal)
            }
            
            // Zone de saisie de texte
            VStack(alignment: .leading, spacing: 10) {
                Text("Donnez nous votre avis")
                    .font(customFont(style: .title3))
                
                TextEditor(text: Binding(
                    get: { dataController.reservations[currentPage].evaluation ?? "" },
                    set: { dataController.reservations[currentPage].evaluation = $0 }
                ))
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
            if !isNewEvaluation {
                // Synchroniser les valeurs de la réservation existante
//                sliderValue = dataController.reservations[currentPage].note ?? 2.5
//                userInput = dataController.reservations[currentPage].evaluation ?? ""
            }
        }
        .padding()
    }
    func eraseEvaluation() {
        dataController.reservations[currentPage].evaluation = nil
        dataController.reservations[currentPage].note = nil
//        sliderValue = 2.5
//        userInput = ""
        
        dismiss()
    }
    func submit() {
//        dataController.reservations[currentPage].evaluation = userInput
//        dataController.reservations[currentPage].note = sliderValue
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
