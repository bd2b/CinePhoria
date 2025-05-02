//
//	KeyChainUtil.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 02/05/2025.
//  bd2db
//


import Foundation
enum KeychainError: Error {
    case conversionError
    case osStatusError(OSStatus)
}

public func setValue(_ value: String, for user: String, and service: String) throws {
    guard let encodedPassword = value.data(using: .utf8) else {
        throw KeychainError.conversionError
    }
  
    var query: [String: Any] = [:]
    query[String(kSecClass)] = kSecClassGenericPassword
    query[String(kSecAttrService)] = service
 //   query[String(kSecAttrAccessGroup)] = service + ".Shared"
    query[String(kSecAttrAccount)] = user
 //   query[String(kSecAttrAccessible)] = kSecAttrAccessibleWhenUnlocked
  
    let status2 = SecItemAdd(query as CFDictionary, nil)
    print("Keychain set status: \(status2)") // Vérifiez ce statut
    
    var status = SecItemCopyMatching(query as CFDictionary, nil)
    switch status {
    case errSecSuccess:
        var attributesToUpdate: [String: Any] = [:]
        attributesToUpdate[String(kSecValueData)] = encodedPassword
        
        status = SecItemUpdate(query as CFDictionary,
                               attributesToUpdate as CFDictionary)
        if status != errSecSuccess {
            throw KeychainError.osStatusError(status)
        }
    case errSecItemNotFound:
        query[String(kSecValueData)] = encodedPassword
        
        status = SecItemAdd(query as CFDictionary, nil)
        if status != errSecSuccess {
            throw KeychainError.osStatusError(status)
        }
    default:
        throw KeychainError.osStatusError(status)
    }
}


public func deleteValue(for user: String, and service: String) throws {
    var query: [String: Any] = [:]
    query[String(kSecClass)] = kSecClassGenericPassword
    query[String(kSecAttrService)] = service
//    query[String(kSecAttrAccessGroup)] = service + ".Shared"
    query[String(kSecAttrAccount)] = user
 //   query[String(kSecAttrAccessible)] = kSecAttrAccessibleAfterFirstUnlock
    
    let status = SecItemDelete(query as CFDictionary)
}

public func getValue(for user: String, and service: String) throws -> String? {
    var query: [String: Any] = [:]
    query[String(kSecClass)] = kSecClassGenericPassword
    query[String(kSecAttrService)] = service
//    query[String(kSecAttrAccessGroup)] = service + ".Shared"
    query[String(kSecAttrAccount)] = user
    query[String(kSecMatchLimit)] = kSecMatchLimitOne
    query[String(kSecReturnAttributes)] = kCFBooleanTrue
    query[String(kSecReturnData)] = kCFBooleanTrue
 //   query[String(kSecAttrAccessible)] = kSecAttrAccessibleAfterFirstUnlock

    var queryResult: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &queryResult)

    switch status {
    case errSecSuccess:
        guard let queriedItem = queryResult as? [String: Any],
              let passwordData = queriedItem[String(kSecValueData)] as? Data,
              let password = String(data: passwordData, encoding: .utf8) else {
            throw KeychainError.conversionError
        }
        return password
    case errSecItemNotFound:
        return nil
    default:
        throw KeychainError.osStatusError(status)
    }
}
