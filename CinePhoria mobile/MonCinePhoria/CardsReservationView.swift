//
//	CardsReservationView.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import SwiftUI
import Giffy

struct CardsReservationView: View {
    @Bindable var dataController: DataController
    @State private var currentPage: Int = 0
    @State private var isShowingAlert: Bool = false
    @StateObject private var viewModel = CardsReservationViewModel()
    
    var body: some View {
        GeometryReader { geometry in
            VStack {
                // Mode paysage
                if geometry.size.width > geometry.size.height {
                    // Mode paysage
                    VStack {
                        HStack {
                            Giffy("camera-cinephoria2")
                                .frame( width: 200, height: 75)
                            Spacer()
                            Text("Mes réservations")
                                .font(customFont(style: .largeTitle))
                                .multilineTextAlignment(.leading)
                            Spacer()
                            Text(dataController.userName ?? "")
                                .font(customFont(style: .body))
                            Spacer()
                            Button(action: {
                                isShowingAlert = true
                            }){
                                Image(systemName: "power")
                                    .foregroundColor( .doréAccentuation)
                            }
                        }
                        .padding(.horizontal, 10)
                        
                    }
                    
                } else {
                    // Mode portrait
                    VStack {
                        HStack {
                        Giffy("camera-cinephoria2")
                                .frame( width: 200, height: 50)
                        Spacer()
                        Button(action: {
                            isShowingAlert = true
                        }){
                            Image(systemName: "power")
                                .foregroundColor( .doréAccentuation)
                            }
                        }
                        .padding(.horizontal, 10)
                        Spacer()
                        HStack (alignment: .lastTextBaseline){
                            Text("Mes réservations")
                                .font(customFont(style: .largeTitle))
                                .multilineTextAlignment(.leading)
                            Spacer()
                            Text(dataController.userName ?? "")
                                .font(customFont(style: .body))
                        }
                    }
                    .frame(height: 130)
                    .padding(.horizontal, 10)
                    .padding(.bottom, 20)
                }
                
                // Cartes avec TabView
                TabView(selection: $currentPage) {
                    ForEach(0..<dataController.reservations.count, id: \.self) { index in
                        CardReservationView(reservation: dataController.reservations[index],
                                            geometry: geometry,
                                            viewModel: viewModel)
                        .tag(index) // Associe chaque vue à un index
                        .padding(10)
#if DEBUG
                .accessibilityIdentifier("CardReservationView\(index)")
#endif
                    }
                }

                
                
                .tabViewStyle(PageTabViewStyle()) // Style de défilement par page
                .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
                .onAppear {
                    viewModel.updateOrientation(currentSize: geometry.size)
                }
                .onChange(of: geometry.size) { newSize , _ in
                    viewModel.updateOrientation(currentSize: newSize)
                }
                
                
                //  .padding(.top, 10)
            }
            .sheet(isPresented: ($viewModel.isSheetShowing), onDismiss: {
                viewModel.resetModals()
            }) {
                if viewModel.isFilmViewShowing {
                    FilmView(film: dataController.reservations[currentPage].film)
                } else {
                    if viewModel.isSeatsViewShowing {
                        SeatsView(reservation: dataController.reservations[currentPage])
                    } else {
                        if viewModel.isQRCodeViewShowing {
                            QRCodeView(isPromoFriandise:
                                 dataController.reservations[currentPage].isPromoFriandise,
                                numberSeatsRestingBeforPromoFriandise: dataController.reservations[currentPage].numberSeatsRestingBeforPromoFriandise,
                                promoFriandiseDiscount: dataController.promoFriandiseDiscount)
                        } else {
                            if viewModel.isEvaluationViewShowing {
                                EvaluationView(reservation: dataController.reservations[currentPage],
                                    isNewEvaluation: true)
                            } else {
                                if viewModel.isEvaluationChangeViewShowing {
                                    EvaluationView(reservation: dataController.reservations[currentPage], isNewEvaluation: false)
                                }
                            }
                        }
                    }
                }
            }
            .alert("Choisissez une option pour vous déconnecter", isPresented: $isShowingAlert)
            {
                Button("Déconnexion simple") {
                    isShowingAlert = false
                    dataController.isLoggedIn = false
                }
                .font(customFont(style: .body))
                .foregroundStyle(.black)
                Button("Suppression des données du téléphone") {
                    isShowingAlert = false
                    dataController.reinit()
                }
                .font(customFont(style: .body))
                .foregroundStyle(.black)
                Button("Annuler") {
                    isShowingAlert = false
                }
                .font(customFont(style: .body))
               
            }
            .font(customFont(style: .body))
        }
    }
}
    /// Persistance des états de présentation des modales
class CardsReservationViewModel: ObservableObject {
    
    @Published var isSheetShowing: Bool = false
    
    // Si une des modals est affichée, on propage à isSheetViewShowing
    // pour avoir une seule variable binding dans .sheet
    @Published var isFilmViewShowing: Bool = false      // Modal du film
    { willSet {if newValue {
        self.isSheetShowing = true
    } } }
    
    @Published var isSeatsViewShowing: Bool = false     // Modal des places
    { willSet {if newValue {
        self.isSheetShowing = true
    } } }
    
    @Published var isQRCodeViewShowing: Bool = false   // Modal du QRCode
    { willSet {if newValue {
        self.isSheetShowing = true
    } } }
    
    @Published var isEvaluationViewShowing: Bool = false   // Modal de l'évaluation
    { willSet {if newValue {
        self.isSheetShowing = true
    } } }
    
    @Published var isEvaluationChangeViewShowing: Bool = false   // Modal de l'évaluation
    { willSet {if newValue {
        self.isSheetShowing = true
    } } }
    
    
    
    @Published private(set) var lastOrientation: CGSize = .zero // Taille précédente pour détecter les changements
    
    func updateOrientation(currentSize: CGSize) {
        if currentSize != lastOrientation {
            lastOrientation = currentSize
        }
    }
    func resetModals() {
        isFilmViewShowing = false
        isSeatsViewShowing = false
        isEvaluationViewShowing = false
        isEvaluationChangeViewShowing = false
        isQRCodeViewShowing = false
    }
}
    
    // Vue pour une carte avec orientation adaptative
struct CardReservationView: View {
    var reservation: Reservation
    var geometry: GeometryProxy
    
    @Environment(\.colorScheme) var colorScheme
    
    @ObservedObject var viewModel: CardsReservationViewModel // Partagé avec la vue parent
    
    
    var body: some View {
        if geometry.size.width > geometry.size.height {
            
            // Mode paysage : disposition horizontale
            HStack (spacing: 30) {
                if let imageFilm = reservation.film.imageFilm {
                    imageFilm.image1024()
                        .resizable()
                        .scaledToFit()
                        .frame(width: geometry.size.width * 0.2, height: geometry.size.height * 0.6)
                        .cornerRadius(10)
                        .padding(.trailing, 10)
                        .onTapGesture {
                            DispatchQueue.main.async {
                                viewModel.isFilmViewShowing = true
                            }
                        }
#if DEBUG
                        .accessibilityIdentifier("ReservationImage")
#endif
                }
               // Spacer()
                VStack(alignment: .leading, spacing: 10) {
                    if colorScheme == .dark {
                        Text(reservation.film.titleFilm)
                            .font(customFont(style: .title))
                            .bold()
                            .foregroundColor(.white)
#if DEBUG
                        .accessibilityIdentifier("ReservationTitle")
#endif
                    } else {
                        Text(reservation.film.titleFilm)
                            .font(customFont(style: .title))
                            .bold()
                            .foregroundColor(.bleuNuitPrimaire)
#if DEBUG
                        .accessibilityIdentifier("ReservationTitle")
#endif
                    }
                    
                    
                    HStack (spacing: 40){
                        
                        SeanceView(seance: reservation.seance)
                            .onTapGesture {
                                DispatchQueue.main.async {
                                    viewModel.isSeatsViewShowing = true
                                }
                            }
#if DEBUG
                        .accessibilityIdentifier("SeanceView")
#endif
                        ActionsView(reservation: reservation)
                            .onTapGesture {
                                DispatchQueue.main.async {
                                    switch reservation.stateReservation {
                                    case .future:
                                        viewModel.isQRCodeViewShowing = true
                                    case .doneUnevaluated:
                                        viewModel.isEvaluationViewShowing = true
                                    case .doneEvaluated:
                                        viewModel.isEvaluationChangeViewShowing = true
                                    }
                                }
                            }
#if DEBUG
                        .accessibilityIdentifier("ActionsView")
#endif
                    }
                }
                .padding(.horizontal, 20)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.horizontal, 20)
            .background(
                RoundedRectangle(cornerRadius: 15)
                    .fill(.blancCasseSecondaire)
                    .shadow(radius: 5)
            )
          //  .padding(.horizontal, 20)
            .padding(.bottom, 20)
            
            
        } else {
            // Mode portrait : disposition verticale
            VStack {
                if let imageFilm = reservation.film.imageFilm {
                    imageFilm.image1024()
                        .resizable()
                        .scaledToFit()
                        .frame(height: geometry.size.height * 0.37)
                        .cornerRadius(10)
                        .padding(.bottom, 10)
                        .onTapGesture {
                            DispatchQueue.main.async {
                                viewModel.isFilmViewShowing = true
                            }
                        }
#if DEBUG
                        .accessibilityIdentifier("ReservationImage")
#endif
                }
                
                if colorScheme == .dark {
                    Text(reservation.film.titleFilm)
                        .font(customFont(style: .title))
                        .bold()
                        .foregroundColor(.white)
#if DEBUG
                        .accessibilityIdentifier("ReservationTitle")
#endif
                } else {
                    Text(reservation.film.titleFilm)
                        .font(customFont(style: .title))
                        .bold()
                        .foregroundColor(.bleuNuitPrimaire)
#if DEBUG
                        .accessibilityIdentifier("ReservationTitle")
#endif
                }
                
                HStack {
                    SeanceView(seance: reservation.seance)
                        .onTapGesture {
                            DispatchQueue.main.async {
                                viewModel.isSeatsViewShowing = true
                            }
                        }
#if DEBUG
                        .accessibilityIdentifier("SeanceView")
#endif
                    ActionsView(reservation: reservation)
                        .onTapGesture {
                            DispatchQueue.main.async {
                                
                                switch reservation.stateReservation {
                                case .future:
                                    viewModel.isQRCodeViewShowing = true
                                case .doneUnevaluated:
                                    viewModel.isEvaluationViewShowing = true
                                case .doneEvaluated:
                                    viewModel.isEvaluationChangeViewShowing = true
                                }
                            }
                        }
#if DEBUG
                        .accessibilityIdentifier("ActionsView")
#endif
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 15)
                    .fill(.blancCasseSecondaire)
                    .shadow(radius: 5)
            )
            .padding(.bottom , 30)
        }
    }
}


#Preview {
    let dataController = DataController()

    // Initialisation des données
    dataController.reservations = reservationsDatabase["admin"] ?? []
    dataController.isLoggedIn = true
    dataController.isLoadingReservations = false
    dataController.userName = "admin"

    return CardsReservationView(dataController: dataController)
}
