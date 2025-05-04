//
//	ListingSallesView.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 03/05/2025.
//  bd2db
//


import SwiftUI
import SwiftData

@MainActor
struct ListingSallesView: View {
    
    @Binding var selectedSalle: Salle?
    @Environment(\.modelContext) var modelContext
    var listCinemasNames: String?  // La liste des cinemas autorisées pour l'employe
    
    
    @Query var allCinemas: [Cinema]
    @State private var filteredCinemaNames: Set<String> = []
    
    @State private var allSalles: [Salle] = []
    
    @MainActor
    var sallesFiltrées: [Salle] {
        allSalles.filter { salle in
            guard let cinema = salle.cinema else { return false }
            return filteredCinemaNames.contains(cinema.nameCinema)
        }
    }
    
    func libelleSalle (salle: Salle) -> String {
        if let cinema = salle.cinema {
            let nombreIncidents = salle.incidents?.count ?? 0
            let nombreIncidentsStr = nombreIncidents > 0 ? "(\(nombreIncidents))" : ""
            return "\(cinema.nameCinema) - \(salle.nameSalle) \(nombreIncidentsStr)"
        }
        return "\(salle.nameSalle)"
    }
    
    
    var body: some View {
        
        List(sallesFiltrées) { salle in
            Button {
                selectedSalle = salle
                print("📌 Salle sélectionnée : \(salle.nameSalle)")
            } label: {
                HStack {
                    VStack(alignment: .leading) {
                        Text(libelleSalle(salle: salle) )
                            .font(.headline)
                        Text("\(String(salle.capacity)) places")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    Text(" ")
                }
                .padding()
            }
            .buttonStyle(.plain)
            .background(
                selectedSalle?.id == salle.id ? Color.accentColor.opacity(0.1) : Color.clear
            )
            .padding(5)
            .clipShape(RoundedRectangle(cornerRadius: 6))
            
        }
        .navigationTitle("Salles avec incidents")
        
        .toolbar {
            Menu {
                ForEach(allCinemas) { cinema in
                    
                    if filteredCinemaNames.contains(cinema.nameCinema) {
                        let name = cinema.nameCinema
                        let isSelected = filteredCinemaNames.contains(name)
                        
                        Button {
                            if isSelected {
                                filteredCinemaNames.remove(name)
                            } else {
                                filteredCinemaNames.insert(name)
                            }
                        } label: {
                            HStack {
                                Text(name)
                                Spacer()
                                if isSelected {
                                    Image(systemName: "checkmark")
                                }
                            }
                        }
                }
                }
                
                Divider()
                
                Button("Tout sélectionner") {
                    filteredCinemaNames = Set(allCinemas.map { $0.nameCinema })
                }
                
                Button("Tout désélectionner") {
                    filteredCinemaNames = []
                }
            } label: {
                Label("Filtrer par cinéma", systemImage: "line.3.horizontal.decrease.circle")
            }
            
        }
        .onAppear {
            assert(Thread.isMainThread, "⚠️ Accès à ListingSallesView hors du thread principal")
        }
        .onAppear {
            var nomsAutorisés: Set<String> = []
            if let listCinemasNames {
                nomsAutorisés = Set(
                    listCinemasNames
                        .components(separatedBy: ",")
                        .map { $0.trimmingCharacters(in: .whitespaces) }
                )
            }
            let nomsDisponibles = Set(allCinemas.map { $0.nameCinema })
            
            // Filtrage réel
            filteredCinemaNames = nomsDisponibles.intersection(nomsAutorisés)
        }
        .onAppear {
                Task {
                    await loadSalles()
                }
            }
    }
    func loadSalles() async {
        do {
            let descriptor = FetchDescriptor<Salle>()
            let toutesSalles = try modelContext.fetch(descriptor)
            allSalles = toutesSalles.sorted {
                let nom1 = $0.cinema?.nameCinema ?? ""
                let nom2 = $1.cinema?.nameCinema ?? ""

                if nom1 != nom2 {
                    return nom1 < nom2
                }
                return $0.nameSalle < $1.nameSalle
            }
        } catch {
            print("❌ Erreur de chargement des salles : \(error)")
        }
    }
    
}
