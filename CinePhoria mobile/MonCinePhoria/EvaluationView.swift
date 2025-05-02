//
//    EvaluationView.swift
//    MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 25/11/2024.
//  bd2db
//


import SwiftUI

struct EvaluationView: View {

    @Bindable var dataController: DataController
    
    @State private var showAlert: Bool = false
    @State private var alertMessage: String = ""
    
    @State var isEvaluationMustBeR: Bool
    var currentPage: Int
    var isNewEvaluation: Bool
    var isDeletingEvaluation: Bool = false
    
    

    
    @State private var sliderValue: Double = 2.5
    @State private var userInput: String = "" // Texte saisi par l'utilisateur
    @State private var originalInput: String = ""
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

                if !userInput.isEmpty {
                    Text(isEvaluationMustBeR ?
                         "Votre commentaire sera publié après relecture" :
                            "Votre commentaire a été validé. Vous pouvez le modifier, il sera republié après relecture.")
                    .font(customFont(style: .caption))
                    .foregroundColor(.gray)
                    .padding(.horizontal)
                }
                    
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
                
                Button(action: {
                    dismiss()
                }) {
                    Label("Annuler", systemImage: "xmark")
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
        
        .onChange(of: userInput) {
            if userInput.trimmingCharacters(in: .whitespacesAndNewlines) != originalInput.trimmingCharacters(in: .whitespacesAndNewlines) {
                isEvaluationMustBeR = true
            } else if userInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                isEvaluationMustBeR = true
            } else {
                isEvaluationMustBeR = false
            }
        }
        .onAppear() {
            if let sliderValue = dataController.reservations[currentPage].note {
                self.sliderValue = sliderValue
            }
            if let userInput = dataController.reservations[currentPage].evaluation {
                self.userInput = userInput
                self.originalInput = userInput
            } else {
                self.userInput = ""
                self.originalInput = ""
                dataController.reservations[currentPage].isEvaluationMustBeReview = false
            }
            isEvaluationMustBeR = dataController.reservations[currentPage].isEvaluationMustBeReview
      }
        .padding()
        .alert("Évaluation", isPresented: $showAlert) {
            Button("OK", role: .cancel) {
                if alertMessage == "Votre évaluation a bien été prise en compte." {
                    dismiss()
                }
            }
        } message: {
            Text(alertMessage)
        }
    }
    func eraseEvaluation() {
        dataController.reservations[currentPage].evaluation = " "
        dataController.reservations[currentPage].note = 2.5
        dataController.reservations[currentPage].isEvaluationMustBeReview = false
        dataController.reservations[currentPage].stateReservation = .DoneUnevaluated
        
        updateEvaluationState(message: "Votre évaluation a été supprimée")
    }
    
    func submit()  {
        dataController.reservations[currentPage].evaluation = userInput
        dataController.reservations[currentPage].note = sliderValue
        dataController.reservations[currentPage].isEvaluationMustBeReview = isEvaluationMustBeR
        dataController.reservations[currentPage].stateReservation = .DoneEvaluated
        
        updateEvaluationState(message: "Votre évaluation a bien été prise en compte.")
    }
    
    fileprivate func updateEvaluationState(message: String) {
        var result: Bool = false
        var setReservation: Bool = false
        var setState: Bool = false
        
        Task {
            do {
                setState = try await setStateReservation(
                    reservationId: dataController.reservations[currentPage].reservationId.uuidString,
                    stateReservation: dataController.reservations[currentPage].stateReservation
                )
                setReservation = try await setEvaluationReservation(
                    reservationId: dataController.reservations[currentPage].reservationId.uuidString,
                    note: dataController.reservations[currentPage].note ?? 2.5,
                    evaluation: dataController.reservations[currentPage].evaluation ?? " ",
                    isEvaluationMustBeReview: dataController.reservations[currentPage].isEvaluationMustBeReview
                )
                result = setReservation && setState
            } catch {
                print("R R S = ", result, setReservation, setState)
                print("Erreur = \(error)")
                result = false
            }
            
            if result {
                alertMessage = "Votre évaluation a bien été prise en compte."
            } else {
                alertMessage = "Nous avons eu un problème à l'enregistrement de votre évaluation. Votre évaluation n'est pas prise en compte. Merci de renouveler l'opération ultérieurement."
            }
            showAlert = true
        }
    }
    
    
}


//#Preview {
//    @Previewable @State var dataController = DataController()
//    EvaluationView(dataController: dataController, currentPage: 0, isNewEvaluation: true)
//}
//
//#Preview {
//    @Previewable @State var dataController = DataController()
//    EvaluationView(dataController: dataController, currentPage: 1, isNewEvaluation: false)
//}
//#Preview {
//    @Previewable @State var dataController = DataController()
//    EvaluationView(dataController: dataController, currentPage: 2, isNewEvaluation: false)
//
// }
