//
//    ActionsView.swift
//    MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import SwiftUI

struct FutureView: View {
    var qrCode: UIImage?
    var body: some View {
        VStack {
            
            if let qrCode {
                Image(uiImage: qrCode)
                    .resizable()
                    .scaledToFit()
                 //   .frame(width: 100, height: 100)
                    .accessibilityIdentifier("QRCode")
            } else {
                Text("QRCode non disponible")
                    .font(customFont(style: .caption))
                    .foregroundStyle(.gray)
                    .accessibilityIdentifier("No QRCode")
            }
        }
        .frame(width: 150, height: 150)
                .padding(10)
                .background(
                    LinearGradient(
                        gradient: Gradient(colors: [.white, .grisPerleFond]),
                        startPoint: .top,
                        endPoint: .bottom
                        
                        )
                    
                    .clipShape(.rect(cornerRadius: 12))
                    .overlay(
                        CustomCornerRadiusShape(radius: 12, corners: [.allCorners])
                            .stroke(.grisPerleFond, lineWidth: 2)
                        )
                    )
            
//            Text("QRCode à présenter à votre entrée")
//                .font(customFont(style: .title3))
//                .foregroundStyle(.bleuNuitPrimaire)
//                .multilineTextAlignment(.center)
//                .accessibilityIdentifier("QRCode")
//        }
//        .frame(width: 150, height: 150)
//        .padding(10)
//        .background(
//            LinearGradient(
//                gradient: Gradient(colors: [.white, .grisPerleFond]),
//                startPoint: .top,
//                endPoint: .bottom
//                    )
//        )
//        .clipShape(.rect(cornerRadius: 12)) // Coins arrondis
//        .overlay( // Ajoute une bordure visible avec coins arrondis
//            CustomCornerRadiusShape(radius: 12, corners: [ .allCorners])
//                .stroke(.grisPerleFond, lineWidth: 2)
//            )
    }
}

struct ToEvaluateView: View {
    var body: some View {
        VStack {
            Text("Donnez nous votre avis !")
                .font(customFont(style: .title3))
                .foregroundStyle(.bleuNuitPrimaire)
                .multilineTextAlignment(.center)
                .accessibilityIdentifier("ToEvaluate")
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
            Group {
                Text("Votre évaluation")
                    .font(customFont(style: .headline))
                    .frame(width: 150, height: 40)
                    .foregroundStyle(.doréAccentuation)
                    .accessibilityIdentifier("Evaluated")
                
                VStack(spacing: 0) {
                    if let evaluation = evaluation {
                        ScrollView {
                            Text(evaluation)
                                .multilineTextAlignment(.center)
                                .font(customFont(style: .caption2))
                            
                                .bold()
                                .padding(10)
                                .frame(maxWidth: .infinity, alignment: .center)
                                .accessibilityIdentifier("EvaluationValue")
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
                            .accessibilityIdentifier("NoteValue")
                    }
                }
                .clipShape(CustomCornerRadiusShape(radius: 10, corners: [.bottomLeft, .bottomRight])) // Coins arrondis
                .overlay(
                    CustomCornerRadiusShape(radius: 10, corners: [.bottomLeft, .bottomRight])
                        .stroke(.grisPerleFond, lineWidth: 0.5)
                )
//                .background(
//                    RoundedRectangle(cornerRadius: 10)
//                        .fill(.argentéTertiaire.opacity(0.2))
//                        .offset(y: 4)
//                )
            }
        }
        .frame(width: 150, height: 150)
    }
}

/// Vue qui présente les 3 états selon le type de reservation
///  future : la reservation n'est pas passée, on doit présenter le QR Code
///  doneUnevaluated : la réservation est passée mais il n'y a pas d'évaluation, on doit présenter la saisie d'une évaluation
///  doneEvaluated :  la réservation est passée et il y a une évaluation, on affiche l'évaluation sans action
struct ActionsView: View {
    
    @ObservedObject var reservation: Reservation
    @Binding var qrCodeImage: UIImage?


    var body: some View {
        Group {
            switch reservation.stateReservation {
            case .ReserveConfirmed:
                FutureView(qrCode: qrCodeImage)
            case .DoneUnevaluated:
                ToEvaluateView()
            case .DoneEvaluated:
                EvaluatedView(evaluation: reservation.evaluation, note: reservation.note)
            default:
                ToEvaluateView()
            }
        }
        .id(reservation.stateReservation)
    }
}
    

//
//#Preview {
//    ActionsView(reservation: Reservation.samplesReservation[0])
//}
//
//#Preview {
//    ActionsView(reservation: Reservation.samplesReservation[1])
//}
//
//#Preview {
//    ActionsView(reservation: Reservation.samplesReservation[2])
//}
//#Preview {
//    ActionsView(reservation: Reservation.samplesReservation[3])
//}
