//
//	CardsReservationView.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//


import SwiftUI
import Giffy

struct CardsReservationView: View {
    var reservations: [Reservation]
    
    // Index de la page actuelle qui permet de retrouver la reservation selectionnée
    @State private var currentPage: Int = 0
    @StateObject private var viewModel = CardsReservationViewModel()
    
    var body: some View {
        
        GeometryReader { geometry in
            VStack {
                // Titre et logo
                if geometry.size.width > geometry.size.height {
                    // Mode paysage
                    HStack {
                        Giffy("camera-cinephoria2")
                            .frame(height: 75)
                        Spacer()
                        Text("Mes réservations")
                            .font(customFont(style: .largeTitle))
                            .multilineTextAlignment(.leading)
                    }
                    .frame( height: 100)
                } else {
                    // Mode portrait
                    VStack {
                        Giffy("camera-cinephoria2")
                            .frame(height: 50)
                        Text("Mes réservations")
                            .font(customFont(style: .largeTitle))
                            .multilineTextAlignment(.leading)
                    }
                    .frame(height: 150)
                }
                
                // Cartes avec TabView
                TabView(selection: $currentPage) {
                    ForEach(0..<reservations.count, id: \.self) { index in
                        CardReservationView(reservation: reservations[index],
                                            geometry: geometry,
                                            viewModel: viewModel)
                        .tag(index) // Associe chaque vue à un index
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
                    FilmView(film: reservations[currentPage].film)
                } else {
                    if viewModel.isSeatsViewShowing {
                        SeatsView(reservation: reservations[currentPage])
                    } else {
                        if viewModel.isQRCodeViewShowing {
                            QRCodeView()
                        } else {
                            if viewModel.isEvaluationViewShowing {
                                EvaluationView(reservation: reservations[currentPage],
                                    isNewEvaluation: true)
                            } else {
                                if viewModel.isEvaluationChangeViewShowing {
                                    EvaluationView(reservation: reservations[currentPage], isNewEvaluation: false)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
    /// Persistance des états de présentation des modales
class CardsReservationViewModel: ObservableObject {
    
    @Published var isSheetShowing: Bool = false
    
    // Si une des modals est affichée, on propage à isSheetViewShowinf
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
            HStack (spacing: 20) {
                if let imageFilm = reservation.film.imageFilm {
                    Image(imageFilm.image1024)
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
                }
                VStack(alignment: .leading, spacing: 10) {
                    if colorScheme == .dark {
                        Text(reservation.film.titleFilm)
                            .font(customFont(style: .title))
                            .bold()
                            .foregroundColor(.white)
                    } else {
                        Text(reservation.film.titleFilm)
                            .font(customFont(style: .title))
                            .bold()
                            .foregroundColor(.bleuNuitPrimaire)
                    }
                    
                    
                    HStack (spacing: 40){
                        
                        SeanceView(seance: reservation.seance)
                            .onTapGesture {
                                DispatchQueue.main.async {
                                    viewModel.isSeatsViewShowing = true
                                }
                            }
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
                    }
                }
                .padding()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            .background(
                RoundedRectangle(cornerRadius: 15)
                    .fill(.blancCasseSecondaire)
                    .shadow(radius: 5)
            )
            .padding()
            
        } else {
            // Mode portrait : disposition verticale
            VStack {
                if let imageFilm = reservation.film.imageFilm {
                    Image(imageFilm.image1024)
                        .resizable()
                        .scaledToFit()
                        .frame(height: geometry.size.height * 0.4)
                        .cornerRadius(10)
                        .padding(.bottom, 10)
                        .onTapGesture {
                            DispatchQueue.main.async {
                                viewModel.isFilmViewShowing = true
                            }
                        }
                }
                
                if colorScheme == .dark {
                    Text(reservation.film.titleFilm)
                        .font(customFont(style: .title))
                        .bold()
                        .foregroundColor(.white)
                } else {
                    Text(reservation.film.titleFilm)
                        .font(customFont(style: .title))
                        .bold()
                        .foregroundColor(.bleuNuitPrimaire)
                }
                
                HStack {
                    SeanceView(seance: reservation.seance)
                        .onTapGesture {
                            DispatchQueue.main.async {
                                viewModel.isSeatsViewShowing = true
                            }
                        }
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
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 15)
                    .fill(.blancCasseSecondaire)
                    .shadow(radius: 5)
            )
            .padding(0)
        }
    }
}


#Preview {
    CardsReservationView(reservations: Reservation.samplesReservation)
}
