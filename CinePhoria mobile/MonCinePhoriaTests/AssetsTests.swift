//
//	AssetsTests.swift
//	MonCinePhoriaTests
//
//  Cree par Bruno DELEBARRE-DEBAY on 02/12/2024.
//  bd2db
//


import Testing
@testable import MonCinePhoria
import SwiftUI

struct AssetsTests {
    let dataConcroller = DataController()
    @Test(arguments: [
        "Argenté (tertiaire)",
        "Blanc Casse (secondaire)",
        "Bleu nuit (primaire)",
        "Doré (accentuation)",
        "Gris perle (fond)",
        "Rouge sombre (erreur)",
        "Vert foncé (succes)"
    ])
    
    func testColors(colorName: String) async throws {
        #expect((UIColor(named: colorName) != nil), "Couleur UI \(colorName) existe")
    }
    
    @Test(arguments:
            [
                "camera-cinephoria-fd-blanc-login",
                "camera-cinephoria-fd-blanc-login-trous trnsp",
                "camera-cinephoria2",
                "camera-cinephoria3"
            ]
    )
    func testFileGif(nameFile: String) async throws {
        #expect(Bundle.main.path(forResource: nameFile, ofType: "gif") != nil, "Fichier \(nameFile).gif existe")
    }
    
    @Test(arguments:
            [
                "Actor-Regular",
                "LCD14"
            ]
    )
    func testFileFont(nameFile: String) async throws {
        #expect(Bundle.main.path(forResource: nameFile, ofType: "ttf") != nil, "Fichier \(nameFile).ttf existe")
    }
    
    @Test(arguments:
            [
                "3D",
                "4DX",
                "4K"
            ]
    )
    func testFileImage(nameFile: String) async throws {
        #expect(Image(nameFile) != nil, "Image \(nameFile)")
    }
    
    @Test(arguments:
            [
                "admin",
                "user@example.com",
                "vide@example.com"
            ] )
    func LoadReservationTests(login: String) async throws {
        
        
        #expect((dataConcroller.login(user: login, pwd: "password", rememberMe: false) == true), "Login")
        
        #expect((dataConcroller.reservations.count >= 0), "Chargement Reservations réussi")
        
    }
    
}
