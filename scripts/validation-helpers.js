
// Scripts de JavaScript para validar el comportamiento durante las pruebas
// Ejecutar en la consola del navegador durante las pruebas

// 1. Verificar estado de permisos unificados
function debugUnifiedPermissions() {
  const permissions = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers
    ?.get(1)?.findFiberByHostInstance?.(document.querySelector('[data-testid="permissions-debug"]'))
    ?.memoizedProps?.permissions;
    
  if (permissions) {
    console.log('🔍 ESTADO ACTUAL DE PERMISOS:');
    console.log('📊 Nivel de acceso:', permissions.accessLevel);
    console.log('💬 Razón:', permissions.accessReason);
    console.log('👤 Es superuser:', permissions.isSuperuser);
    console.log('📝 Plan actual:', permissions.planActual);
    
    console.log('🔒 PERMISOS DE CREACIÓN:');
    console.log('  Conductores:', permissions.canCreateConductor);
    console.log('  Vehículos:', permissions.canCreateVehiculo);
    console.log('  Socios:', permissions.canCreateSocio);
    console.log('  Cartas Porte:', permissions.canCreateCartaPorte);
    console.log('  Archivos:', permissions.canUploadFile);
    
    console.log('📈 USO ACTUAL:');
    console.log('  Conductores:', permissions.usage.conductores);
    console.log('  Vehículos:', permissions.usage.vehiculos);
    console.log('  Socios:', permissions.usage.socios);
    console.log('  Cartas Porte:', permissions.usage.cartas_porte);
    console.log('  Almacenamiento:', permissions.usage.almacenamiento);
    
    return permissions;
  } else {
    console.warn('❌ No se pudo obtener el estado de permisos');
    return null;
  }
}

// 2. Simular cambio de plan para testing
async function simulatePlanUpgrade(userId, newPlanId) {
  console.log('🔄 Simulando upgrade de plan...');
  console.log('👤 Usuario:', userId);
  console.log('📦 Nuevo plan:', newPlanId);
  
  // Esta función debe implementarse con la lógica real de upgrade
  // Por ahora solo logea la acción
  console.log('⚠️ Función de upgrade pendiente de implementación');
}

// 3. Verificar comportamiento de botones según permisos
function validateButtonStates() {
  const buttons = [
    { selector: '[data-testid="new-conductor-btn"]', name: 'Nuevo Conductor' },
    { selector: '[data-testid="new-vehiculo-btn"]', name: 'Nuevo Vehículo' },
    { selector: '[data-testid="new-socio-btn"]', name: 'Nuevo Socio' },
    { selector: '[data-testid="new-carta-porte-btn"]', name: 'Nueva Carta Porte' },
    { selector: '[data-testid="upload-file-btn"]', name: 'Subir Archivo' }
  ];
  
  console.log('🔘 ESTADO DE BOTONES:');
  buttons.forEach(({ selector, name }) => {
    const button = document.querySelector(selector);
    if (button) {
      const isDisabled = button.disabled || button.hasAttribute('disabled');
      const isVisible = button.offsetParent !== null;
      console.log(`  ${name}: ${isVisible ? (isDisabled ? '🔒 Deshabilitado' : '✅ Habilitado') : '👻 No visible'}`);
    } else {
      console.log(`  ${name}: ❓ No encontrado`);
    }
  });
}

// 4. Monitorear cambios en tiempo real
function startPermissionsMonitor() {
  let lastPermissionsHash = '';
  
  const monitor = setInterval(() => {
    const permissions = debugUnifiedPermissions();
    if (permissions) {
      const currentHash = JSON.stringify({
        accessLevel: permissions.accessLevel,
        usage: permissions.usage
      });
      
      if (currentHash !== lastPermissionsHash) {
        console.log('🔄 CAMBIO DETECTADO EN PERMISOS');
        console.log('⏰ Timestamp:', new Date().toISOString());
        validateButtonStates();
        lastPermissionsHash = currentHash;
      }
    }
  }, 2000);
  
  console.log('👁️ Monitor de permisos iniciado (cada 2 segundos)');
  console.log('⏹️ Para detener: clearInterval(' + monitor + ')');
  
  return monitor;
}

// 5. Test de límites de almacenamiento
function testStorageLimit() {
  console.log('💾 PRUEBA DE LÍMITE DE ALMACENAMIENTO');
  const permissions = debugUnifiedPermissions();
  
  if (permissions) {
    const { almacenamiento } = permissions.usage;
    const { usedGB, limit } = almacenamiento;
    
    console.log(`📊 Uso actual: ${usedGB.toFixed(2)} GB`);
    console.log(`📊 Límite: ${limit ? `${limit} GB` : 'Ilimitado'}`);
    
    if (limit) {
      const percentage = (usedGB / limit) * 100;
      console.log(`📊 Porcentaje usado: ${percentage.toFixed(1)}%`);
      
      if (percentage >= 100) {
        console.log('🚨 LÍMITE EXCEDIDO - Subida de archivos debe estar bloqueada');
      } else if (percentage >= 80) {
        console.log('⚠️ CERCA DEL LÍMITE - Debe aparecer advertencia');
      } else {
        console.log('✅ DENTRO DEL LÍMITE - Subida permitida');
      }
    }
  }
}

// Exponer funciones globalmente para uso en pruebas
window.testingHelpers = {
  debugUnifiedPermissions,
  simulatePlanUpgrade,
  validateButtonStates,
  startPermissionsMonitor,
  testStorageLimit
};

console.log('🧪 Helpers de testing cargados. Usa window.testingHelpers para acceder a las funciones.');
