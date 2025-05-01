//
//    CardsReservationView.swift
//    MonCinePhoria
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
    // Cache des QR codes pour éviter de les charger plusieurs fois entre CardView et QRCodeView
    @State private var qrCodeCache: [UUID: UIImage] = [:]
    // Cache des images qui permet de ne pas charger plusieurs fois l'image entre CardView et ViewFilm
    @State private var imageCache: [UUID: AnyView] = [:]
    // Cache pour les détails de places
    @State private var seatsForReservationCache: [UUID: [SeatsForReservation]] = [:]
    
    // Variable pour initialiser le cache des qrCode
    @State private var didInitializeCache = false
    
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
                            Text(dataController.reservations[0].displayName)
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
                            Text(dataController.reservations[0].displayName)
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
                        CardReservationView(
                            dataController: dataController,
                            reservationIndex: index,
                            geometry: geometry,
                            viewModel: viewModel,
                            imageCache: $imageCache,
                            qrCodeCache: $qrCodeCache,
                            seatsForReservationCache: $seatsForReservationCache
                        )
                        .tag(index)
                        .padding(10)
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
                    FilmView(
                        reservation: dataController.reservations[currentPage],
                        imageFilmView: imageCache[dataController.reservations[currentPage].reservationId]
                    )
                } else {
                    if viewModel.isSeatsViewShowing {
                        SeatsView(reservation: dataController.reservations[currentPage],
                                  seatsForReservation: seatsForReservationCache[dataController.reservations[currentPage].reservationId]!
                        )
                    } else {
                        if viewModel.isQRCodeViewShowing {
                            QRCodeView(
                                qrCodeImage: qrCodeCache[dataController.reservations[currentPage].reservationId], reservation: dataController.reservations[currentPage],
                                isPromoFriandise: dataController.reservations[currentPage].isPromoFriandise,
                                numberSeatsRestingBeforPromoFriandise: dataController.reservations[currentPage].numberSeatsRestingBeforPromoFriandise,
                                promoFriandiseDiscount: dataController.promoFriandiseDiscount
                            )
                        } else {
                            if viewModel.isEvaluationViewShowing {
                                EvaluationView(dataController: dataController, isEvaluationMustBeR: dataController.reservations[currentPage].isEvaluationMustBeReview, currentPage: currentPage, isNewEvaluation: true)
                            } else {
                                if viewModel.isEvaluationChangeViewShowing {
                                    EvaluationView(dataController: dataController, isEvaluationMustBeR: dataController.reservations[currentPage].isEvaluationMustBeReview, currentPage: currentPage, isNewEvaluation: false)
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
        .onAppear {
//            if !didInitializeCache {
//                for reservation in dataController.reservations {
//                    if qrCodeCache[reservation.reservationId] == nil,
//                       let data = reservation.qrCodeData,
//                       let image = UIImage(data: Data(data)) {
//                        qrCodeCache[reservation.reservationId] = image
//                    } else {
//                        // On va chercher le qrCode
//                        
//                    }
//                }
//                didInitializeCache = true
//            }
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
    @Bindable var dataController: DataController
    var reservationIndex: Int
    var reservation: Reservation { dataController.reservations[reservationIndex] }
    
    var geometry: GeometryProxy
    
    @Environment(\.colorScheme) var colorScheme
    
    @ObservedObject var viewModel: CardsReservationViewModel // Partagé avec la vue parent
    
    @Binding var imageCache: [UUID: AnyView]
    @Binding var qrCodeCache: [UUID: UIImage]
    @Binding var seatsForReservationCache: [UUID: [SeatsForReservation]]
    
    @State private var imageView: AnyView? = nil
    @State private var qrCodeImage: UIImage? = nil
    @State private var seatsForReservation: [SeatsForReservation]? = nil

    
    var body: some View {
        // Declare imageView once at the start of body
        
        
        Group {
            if geometry.size.width > geometry.size.height {
                
                // Mode paysage : disposition horizontale
                HStack (spacing: 30) {
                    imageView
                        .scaledToFit()
                        .frame(width: geometry.size.width * 0.2, height: geometry.size.height * 0.6)
                        .cornerRadius(10)
                        .padding(.trailing, 10)
                        .onTapGesture {
                            DispatchQueue.main.async {
                                viewModel.isFilmViewShowing = true
                            }
                        }
                        .accessibilityIdentifier("ReservationImage")
                    
                    // Spacer()
                    VStack(alignment: .leading, spacing: 10) {
                        if colorScheme == .dark {
                            Text(reservation.titleFilm)
                                .font(customFont(style: .title))
                                .bold()
                                .foregroundColor(.white)
                                .accessibilityIdentifier("ReservationTitle")
                        } else {
                            Text(reservation.titleFilm)
                                .font(customFont(style: .title))
                                .bold()
                                .foregroundColor(.bleuNuitPrimaire)
                                .accessibilityIdentifier("ReservationTitle")
                        }
                        
                        
                        HStack (spacing: 40){
                            
                            SeanceView(reservation: dataController.reservations[reservationIndex])
                                .onTapGesture {
                                    DispatchQueue.main.async {
                                        viewModel.isSeatsViewShowing = true
                                    }
                                }
                                .accessibilityIdentifier("SeanceView")
                            
                            ActionsView(reservation: reservation, qrCodeImage: $qrCodeImage)
                                .onTapGesture {
                                    DispatchQueue.main.async {
                                        switch reservation.stateReservation {
                                        case .ReserveConfirmed:
                                            viewModel.isQRCodeViewShowing = true
                                        case .DoneUnevaluated:
                                            viewModel.isEvaluationViewShowing = true
                                        case .DoneEvaluated:
                                            viewModel.isEvaluationChangeViewShowing = true
                                        default:
                                            viewModel.isQRCodeViewShowing = true
                                        }
                                    }
                                }
                                .accessibilityIdentifier("ActionsView")
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
                    imageView
                    
                    //   .resizable()
                        .scaledToFit()
                        .frame(height: geometry.size.height * 0.37)
                        .cornerRadius(10)
                        .padding(.bottom, 10)
                        .onTapGesture {
                            DispatchQueue.main.async {
                                viewModel.isFilmViewShowing = true
                            }
                            
                            
                        }
                        .accessibilityIdentifier("ReservationImage")
                    
                    if colorScheme == .dark {
                        Text(reservation.titleFilm)
                            .font(customFont(style: .title))
                            .bold()
                            .foregroundColor(.white)
                            .accessibilityIdentifier("ReservationTitle")
                    } else {
                        Text(reservation.titleFilm)
                            .font(customFont(style: .title))
                            .bold()
                            .foregroundColor(.bleuNuitPrimaire)
                            .accessibilityIdentifier("ReservationTitle")
                    }
                    
                    HStack {
                        SeanceView(reservation: dataController.reservations[reservationIndex])
                            .onTapGesture {
                                DispatchQueue.main.async {
                                    viewModel.isSeatsViewShowing = true
                                }
                            }
                            .accessibilityIdentifier("SeanceView")
                        
                        ActionsView(reservation: reservation, qrCodeImage: $qrCodeImage)
                            .onTapGesture {
                                DispatchQueue.main.async {
                                    
                                    switch reservation.stateReservation {
                                    case .ReserveConfirmed:
                                        viewModel.isQRCodeViewShowing = true
                                    case .DoneUnevaluated:
                                        viewModel.isEvaluationViewShowing = true
                                    case .DoneEvaluated:
                                        viewModel.isEvaluationChangeViewShowing = true
                                    default:
                                        viewModel.isQRCodeViewShowing = true
                                    }
                                }
                            }
                            .accessibilityIdentifier("ActionsView")
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
        
        .onAppear {
            if imageCache[reservation.reservationId] == nil {
                let view = AnyView(loadOrFetchImage(for: reservation, userEmail: dataController.userMail!))
                imageCache[reservation.reservationId] = view
            }
            imageView = imageCache[reservation.reservationId]
            Task {
                if qrCodeCache[reservation.reservationId] == nil {
                    if reservation.stateReservation == .ReserveConfirmed {
                        // La reservation est dans le futur
                        if let img = await dataController.loadOrFetchQRCode(for: reservationIndex) {
                            qrCodeCache[reservation.reservationId] = img
                            qrCodeImage = img
                        }
                    }
                } else {
                    qrCodeImage = qrCodeCache[reservation.reservationId]
                }
            }
            Task {
                if seatsForReservationCache[reservation.reservationId] == nil {
                    
                        // La reservation est dans le futur
                        if let seatsForR = await dataController.loadOrFetchSeatsForReservation(for: reservationIndex) {
                            seatsForReservationCache[reservation.reservationId] = seatsForR
                            seatsForReservation = seatsForR
                        }
                    
                } else {
                    seatsForReservation = seatsForReservationCache[reservation.reservationId]
                }
            }
        }
        
    }
}

//#Preview {
//    let dataController = DataController()
//
//    // Initialisation des données
//    dataController.reservations = reservationsDatabase["admin"] ?? []
//    dataController.isLoggedIn = true
//    dataController.isLoadingReservations = false
//    dataController.userMail = "admin"
//
//    return CardsReservationView(dataController: dataController)
//}
