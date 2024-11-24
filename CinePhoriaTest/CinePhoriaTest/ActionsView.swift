//
//	ActionsView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import SwiftUI

struct FutureView: View {
    let showQRCode: () -> Void
    var body: some View {
        VStack {
            Text("Présentez le QRCode à votre entrée")
                .font(customFont(style: .title3))
                .multilineTextAlignment(.center)
            Button(action: showQRCode) {
                Label("QRCode", systemImage: "qrcode")
                    .padding(5)
                    .font(.headline)
            }
            .buttonStyle(.bordered)
        }
        .frame(width: 150, height: 150)
        .padding(10)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [.white, .grisPerleFond]),
                startPoint: .top,
                endPoint: .bottom
                    )
        )
        .clipShape(.rect(cornerRadius: 12)) // Coins arrondis
        .overlay( // Ajoute une bordure visible avec coins arrondis
            CustomCornerRadiusShape(radius: 12, corners: [ .allCorners])
                .stroke(.grisPerleFond, lineWidth: 2)
            )
    }
}

struct ToEvaluateView: View {
    let evaluateReservation: () -> Void
    var body: some View {
        VStack {
            Text("Donnez nous votre avis !")
                .font(customFont(style: .title3))
                .multilineTextAlignment(.center)
            Button(action: evaluateReservation) {
                Label("Evaluer", systemImage: "questionmark.bubble")
                    .padding(5)
                    .font(.headline)
            }
            .buttonStyle(.bordered)
        }
        .frame(width: 150, height: 150)
        .padding(10)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [.white, .grisPerleFond]),
                startPoint: .top,
                endPoint: .bottom
                    )
        )
        .clipShape(.rect(cornerRadius: 12)) // Coins arrondis
        .overlay( // Ajoute une bordure visible avec coins arrondis
            CustomCornerRadiusShape(radius: 12, corners: [ .allCorners])
                .stroke(.grisPerleFond, lineWidth: 2)
            )
    }
}


struct EvaluatedView: View {
    var evaluation: String?
    var note: Double?

    var body: some View {
        VStack(spacing: 0) {
            Text("Votre évaluation")
                .font(customFont(style: .title3))
                .frame(width: 150, height: 40)
                .foregroundStyle(.white)
                .background(.bleuNuitPrimaire) // Remplacez par `.bleuNuitPrimaire`
                .clipShape(CustomCornerRadiusShape(radius: 10, corners: [.topLeft, .topRight]))

            VStack(spacing: 0) {
                if let evaluation = evaluation {
                    ScrollView {
                        Text(evaluation)
                            .font(customFont(style: .caption2))
                            .multilineTextAlignment(.center)
                            .bold()
                            .padding(5)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(width: 150, height: 100) // Limite la hauteur
                }
                if let note = note {
                    Text("Note: \(String(note))")
                        .font(customFont(style: .caption))
                        .multilineTextAlignment(.leading)
                        .frame(width: 150, height: 20)
                        .foregroundStyle(.white)
                        .background(.doréAccentuation)
                }
            }
            .clipShape(CustomCornerRadiusShape(radius: 10, corners: [.bottomLeft, .bottomRight])) // Coins arrondis
            .overlay(
                CustomCornerRadiusShape(radius: 10, corners: [.bottomLeft, .bottomRight])
                    .stroke(.grisPerleFond, lineWidth: 0.5)
            )
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(.argentéTertiaire.opacity(0.2))
                    .offset(y: 4)
            )
        }
        .frame(width: 150, height: 150)
    }
}

/// Vue qui présente les 3 états selon le type de reservation
///  future : la reservation n'est pas passée, on doit présenter le QR Code
///  doneUnevaluated : la réservation est passée mais il n'y a pas d'évaluation, on doit présenter la saisie d'une évaluation
///  doneEvaluated :  la réservation est passée et il y a une évaluation, on affiche l'évaluation sans action
struct ActionsView: View {
    
    var reservation: Reservation
    @StateObject var viewModel: ActionsViewModel
    
    // Initialisateur personnalisé pour créer le ViewModel à partir de la réservation
    init(reservation: Reservation) {
        self.reservation = reservation
        _viewModel = StateObject(wrappedValue: ActionsViewModel(stateReservation: reservation.stateReservation))
    }
    var body: some View {
        switch viewModel.stateReservation {
        case .future:
            FutureView(showQRCode: viewModel.showQRCode)
        case .doneUnevaluated:
            ToEvaluateView(evaluateReservation: viewModel.evaluateReservation)
        case .doneEvaluated:
            EvaluatedView(evaluation: reservation.evaluation, note: reservation.note)
        }
    }
}
    


#Preview {
    ActionsView(reservation: Reservation(id: 1, seance: Seance.samples[0]))
}

#Preview {
    ActionsView(reservation: Reservation(id: 1, seance: Seance.samples[1]))
}

#Preview {
    ActionsView(reservation: Reservation(id: 1, seance: Seance.samples[1] , evaluation: "Très bon film", note: 4.5))
}
#Preview {
    ActionsView(reservation: Reservation(id: 1, seance: Seance.samples[1] , evaluation: """
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ullamcorper tincidunt justo id dignissim. Quisque vel erat sit amet augue suscipit cursus. Curabitur tempor elit tellus, nec consequat orci egestas eget. Aenean vitae maximus ex, ac blandit sem. Nulla mattis magna volutpat, rhoncus quam quis, egestas diam. Nunc sit amet fringilla erat, sit amet tincidunt ante. Pellentesque nec urna vestibulum, porta risus at, tempus risus. Aenean vel turpis tincidunt lacus aliquam hendrerit porta nec quam. Maecenas id nunc sollicitudin, mattis velit in, bibendum quam. Maecenas non elementum orci. Aliquam ut dolor erat. Cras quis hendrerit eros. Praesent condimentum magna nec ipsum auctor volutpat. 
""", note: 4.5))
}
