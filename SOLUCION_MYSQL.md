# 🔧 Solución: Usuario no se guarda en la base de datos

## ❌ Problema Identificado

El error es: **MySQL/MariaDB no está corriendo en tu computadora**

Error completo:
```
❌ Error al conectar a MySQL: connect ECONNREFUSED 127.0.0.1:3306
```

---

## ✅ Solución Paso a Paso

### **PASO 1: Verificar si MySQL está corriendo**

Ejecuta este comando para probar la conexión:

```bash
node test-conexion.js
```

**Si ves errores**, sigue los pasos según tu sistema operativo.

---

### **PASO 2: Iniciar MySQL según tu Sistema Operativo**

#### 🪟 **Windows (XAMPP)**

1. Abre **XAMPP Control Panel**
2. Click en **Start** junto a **MySQL**
3. Debería aparecer en verde y decir "Running"
4. Si no inicia, revisa que el puerto 3306 no esté ocupado

#### 🍎 **Mac**

```bash
# Si instalaste con Homebrew
brew services start mysql

# O manualmente
mysql.server start

# Verificar estado
brew services list | grep mysql
```

#### 🐧 **Linux**

```bash
# Ubuntu/Debian
sudo systemctl start mysql
sudo systemctl status mysql

# O con MariaDB
sudo systemctl start mariadb
sudo systemctl status mariadb
```

---

### **PASO 3: Verificar que la base de datos existe**

1. Abre **phpMyAdmin**: `http://localhost/phpmyadmin`
2. En el panel izquierdo, busca la base de datos **paperease**
3. Si NO existe:
   - Click en "Nueva" (New)
   - Nombre: `paperease`
   - Cotejamiento: `utf8mb4_general_ci`
   - Click "Crear"

---

### **PASO 4: Verificar que las tablas existen**

1. En phpMyAdmin, selecciona la base de datos **paperease**
2. Deberías ver estas tablas:
   - ✅ roles
   - ✅ estudiante
   - ✅ trabajador_social
   - ✅ sesiones
   - ✅ auditoria_acceso
   - ✅ genero
   - ✅ facultad
   - ✅ programa
   - ✅ tipoprograma
   - ✅ eventos
   - ✅ formulario_estudiante

3. **Si faltan tablas**, ejecuta los scripts SQL de la FASE 1 nuevamente:
   - Ve a la pestaña **SQL** en phpMyAdmin
   - Copia y pega cada script del archivo que te proporcioné
   - Click en **Continuar**

---

### **PASO 5: Verificar credenciales de conexión**

Abre el archivo `backend/conexion.js` y verifica:

```javascript
{
  host: 'localhost',
  user: 'root',        // ← Usuario de MySQL
  password: '',        // ← Contraseña (vacío por defecto en XAMPP)
  database: 'paperease'
}
```

**Valores comunes:**
- XAMPP: user=`root`, password=`` (vacío)
- MAMP: user=`root`, password=`root`
- Linux: user=`root`, password=`tu_contraseña`

---

### **PASO 6: Probar la conexión nuevamente**

```bash
node test-conexion.js
```

**Salida esperada:**
```
✅ Conexión exitosa!
✅ Query de prueba funcionó
📋 Tablas en la base de datos paperease:
  ✓ auditoria_acceso
  ✓ estudiante
  ✓ eventos
  ✓ facultad
  ...
✅ ¡Todo está bien! La base de datos está lista.
```

---

### **PASO 7: Iniciar el servidor**

```bash
node backend/index.js
```

**Salida esperada:**
```
✅ Conexión exitosa a MySQL
🚀 Servidor corriendo en http://localhost:3000
```

---

### **PASO 8: Probar el registro**

#### **Opción A: Desde el navegador**

1. Abre: `http://localhost:3000`
2. Completa el formulario de registro
3. Click en "Crear Cuenta"

#### **Opción B: Desde la terminal**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "Usuario",
    "email": "test@utp.ac.pa",
    "password": "Test123!",
    "rol": 1
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Estudiante registrado exitosamente",
  "usuario": {
    "id": 1,
    "email": "test@utp.ac.pa",
    "nombre": "Test",
    "apellido": "Usuario",
    "rol": 1,
    "tipoUsuario": "estudiante"
  }
}
```

---

### **PASO 9: Verificar en la base de datos**

En phpMyAdmin:

```sql
SELECT * FROM estudiante;
```

Deberías ver el usuario recién creado.

---

## 🐛 Errores Comunes y Soluciones

### Error: `ECONNREFUSED`
```
❌ Causa: MySQL no está corriendo
✅ Solución: Inicia MySQL (PASO 2)
```

### Error: `ER_BAD_DB_ERROR`
```
❌ Causa: Base de datos "paperease" no existe
✅ Solución: Créala en phpMyAdmin (PASO 3)
```

### Error: `ER_ACCESS_DENIED_ERROR`
```
❌ Causa: Usuario o contraseña incorrectos
✅ Solución: Revisa backend/conexion.js (PASO 5)
```

### Error: `ER_NO_SUCH_TABLE`
```
❌ Causa: Las tablas no existen
✅ Solución: Ejecuta scripts SQL de FASE 1 (PASO 4)
```

### Usuario no aparece en la BD
```
❌ Causa: Error silencioso en el servidor
✅ Solución: Revisa los logs del servidor
   node backend/index.js
   (Observa los mensajes en la consola)
```

---

## 📞 Verificación Rápida

Checklist antes de probar:

- [ ] MySQL/MariaDB está corriendo
- [ ] Base de datos `paperease` existe
- [ ] Tablas creadas (estudiante, trabajador_social, etc.)
- [ ] Credenciales correctas en `backend/conexion.js`
- [ ] Script `test-conexion.js` pasa sin errores
- [ ] Servidor corriendo sin errores (`node backend/index.js`)

---

## 🔍 Debug Avanzado

Si todo lo anterior está bien pero sigue sin funcionar:

1. **Revisar logs del servidor:**
   ```bash
   node backend/index.js
   ```
   Observa los errores en la consola

2. **Revisar tabla de auditoría:**
   ```sql
   SELECT * FROM auditoria_acceso ORDER BY FechaHora DESC LIMIT 10;
   ```

3. **Probar query directo:**
   ```bash
   mysql -u root -p paperease
   ```
   ```sql
   INSERT INTO estudiante (Email, Password, Nombre, Apellido)
   VALUES ('test@utp.ac.pa', 'hash123', 'Test', 'Usuario');

   SELECT * FROM estudiante;
   ```

---

## ✅ Correcciones Realizadas

He corregido el código de conexión:

**Antes (conexión simple):**
```javascript
const conexion = mysql.createConnection({...});
```

**Ahora (pool de conexiones):**
```javascript
const pool = mysql.createPool({...});
```

Esto es mejor porque:
- ✅ Maneja múltiples queries simultáneas
- ✅ Reusa conexiones
- ✅ Más estable y eficiente
- ✅ Soporta `.promise()` correctamente

---

**¡Sigue estos pasos y el registro debería funcionar!** 🚀
