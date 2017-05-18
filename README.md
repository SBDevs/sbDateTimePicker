# sbDateTimePicker
Control HTML para la selección de fecha o fecha y hora para AngularJS
Esta directiva ha sido creada para que sea compatible con la mayoria de los navegadores (especialmente con IE y Chrome).

### Implementación
#### Paso 1: Añadir los ficheros del SB-dateTimePicker al proyecto
Copiar los ficheros CSS y JS a sus carpetas correspondientes en la raíz del proyecto; incluir dentro de la carpeta JS la carpeta Templates

#### Paso 2: Incluir los archivos en tu aplicación
```html
<!doctype html>
<html ng-app="myApp">
    <head>
        <link rel="stylesheet" href="css/sbDtp.css" />
        <script src="js/angular.min.js"></script>
        <script src="js/sbDtp.min.js"></script>
        ...
    </head>
    <body>
        ...
    </body>
</html>
```
#### Paso 3: Inyectar el módulo SB-dateTimePicker
```javascript
var app = angular.module('myApp', ['SB-dateTimePicker']);
```
#### Paso 4: Agregar la directiva sb-dtp en el HTML donde se quiera hacer uso
```html
<sb-dtp ng-model='date'></sb-dtp>
```
---
### Opciones
#### Establecer opciones para toda la aplicación
```javascript
app.config(['SBdtpProvider', function(SBdtp) {
    SBdtp.setOpciones({
        calType: 'gregorian',
        format: 'DD/MM/YYYY (hh:mm)',
        default: 'today',
        ...
    });
}]);
```
#### Establecer opciones para cada directiva
```html
<!-- pasar las opciones desde el controlador -->
<sb-dtp ng-model='date1' options='date1_opciones'></sb-dtp>
<!-- o escribirlas directamente sobre la declaración del control personalizado -->
<sb-dtp ng-model='date2' options="{default:'12/05/2017', dtpType: 'date', format: 'DD/MM/YY'}" mindate="'03/05/2017'" maxdate="1496008800000"></sb-dtp>
```
#### Parámetros
Nombre  |	Tipo  |	Por defecto |	Descripción
------------- | ------------- | ------------- | -------------
calType | Cadena | 'gregorian' | El tipo de calendario gregoriano 'gregorian' es el único disponible
dtpType	| Cadena | 'date&time' | 'date&time' para fijar funcionalidad completa; 'date' para solo establecer la fecha.
default | Numérico, Cadena, Fecha | -- | Fecha inicial puede ser un valor numérico(UNIX timestamp milliseconds), Cadena o Fecha y también la palabra reservada 'today' para fijarla a la fecha actual
format | Cadena | 'YYYY/MM/DD hh:mm' | Cualquier combinación de YYYY, YY, MM, DD, hh, mm. (Por ejemplo, DD/MM/YY)
autoClose | Booleano | false | Cierra SBdtp al selección un día
transition | Booleano | true | Efecto de transición al cargar los días
gregorianStartDay | Numérico | 1 | 0 para Domingo, 1 for Lunes, ...
minutePass | Numérico | 1 | Cada paso de incremento o decremento para los minutos
zIndex | Numérico | 9 | z-index del popup del datePicker
---
### Marcación de Rango de Fechas
```html
<!-- mindate & maxdate aceptan tanto valores UNIX-timestamps como fechas en formato cadena -->
<sb-dtp ng-model="date" options="{default:'2015/12/15'}" mindate="1449866902553" maxdate="'2015/12/18'"></sb-dtp>
```
---
### Deshabilitación SBdtp
```html
<!-- deshabilitar permanentemente -->
<sb-dtp ng-model='date' disable='true'></sb-dtp>

<!-- deshabilitar dinamicamente -->
<sb-dtp ng-model='date1' ></sb-dtp>
<sb-dtp ng-model='date2' disable='{{!date1}}'></sb-dtp>
```
---
### Idiomas o diccionario para el calendario
```javascript
{
    calType:'gregorian', 
    multiple:false,
    gregorianDic: {
        title: 'Grégorien',
        monthsNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        daysNames: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        todayBtn: "Aujourd'hui"
    }
}
```
---
### Día de comienzo de semana para el calendario gregoriano
```html
<!-- 
    0 -> Domingo
    1 -> Lunes
    ...
    6 -> Sábadp
-->
<sb-dtp ng-model='date' options='{gregorianStartDay: 1}'></sb-dtp>
```
