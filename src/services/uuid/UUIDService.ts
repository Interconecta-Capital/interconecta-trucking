
export class UUIDService {
  static generateValidIdCCP(): string {
    // Generar un UUID válido para IdCCP
    const uuid = crypto.randomUUID();
    return uuid.replace(/-/g, '').toUpperCase().substring(0, 36);
  }
}
