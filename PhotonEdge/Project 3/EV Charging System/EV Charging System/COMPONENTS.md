# Component Documentation

Detailed documentation for all React components in the Smart EV Auto-Reservation Platform.

---

## App.jsx

**Path:** `client/src/App.jsx`

**Purpose:** Main application component that manages routing, state, and business logic.

### State Management

| State Variable | Type | Purpose |
|----------------|------|---------|
| `chargers` | Array | List of all charging stations |
| `myPos` | Array | EV current position [lat, lng] |
| `batteryLevel` | Number | Current battery percentage (0-100) |
| `activeReservation` | Object | Currently active reservation data |
| `showLowBatteryToast` | Boolean | Show/hide low battery warning |
| `countdown` | Number | Countdown timer (15s) for auto-reserve |
| `emergencyActive` | Boolean | Emergency overlay status |

### Key Functions

#### `fetchChargers()`
Fetches all chargers from API and updates state.

```javascript
const fetchChargers = async () => {
  const res = await axios.get('/api/chargers');
  setChargers(res.data);
};
```

#### `getNearestAvailableCharger()`
Finds closest available charger using Euclidean distance.

```javascript
const getNearestAvailableCharger = () => {
  const available = chargers.filter(c => c.available === 1);
  return available.sort((a, b) => {
    const dA = Math.sqrt(Math.pow(a.lat - myPos[0], 2) + Math.pow(a.lng - myPos[1], 2));
    const dB = Math.sqrt(Math.pow(b.lat - myPos[0], 2) + Math.pow(b.lng - myPos[1], 2));
    return dA - dB;
  })[0];
};
```

#### `reserveEmergency()`
Handles emergency booking for battery < 10%.

```javascript
const reserveEmergency = async () => {
  setEmergencyActive(true);
  const res = await axios.post('/api/battery-emergency', {
    lat: myPos[0],
    lng: myPos[1],
    ev_id: "EV-EMERGENCY-001"
  });
  // ... handle response
};
```

#### `normalReserve()`
Handles normal reservation for battery 10-20%.

```javascript
const normalReserve = async () => {
  const target = getNearestAvailableCharger();
  const res = await axios.post('/api/reserve', {
    charger_id: target.id,
    ev_id: "EV-AUTO-001"
  });
  // ... handle response
};
```

### Routes
- `/` - Main dashboard
- `/admin` - Admin panel
- `/scanner` - QR scanner page

---

## MapView.jsx

**Path:** `client/src/components/MapView.jsx`

**Purpose:** Interactive Leaflet map showing EV position, chargers, and routes.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `myPos` | Array | EV position [lat, lng] |
| `activeReservation` | Object | Active reservation data |

### Features
- **EV Marker:** Blue car icon at current position
- **Charger Markers:** Green (available) or red (occupied)
- **Route Polyline:** Dotted line from EV to reserved charger
- **Popup:** Charger details on marker click

### Dependencies
- `leaflet`
- `react-leaflet`

### Example Usage
```jsx
<MapView 
  myPos={[18.5204, 73.8567]} 
  activeReservation={reservationData} 
/>
```

---

## BatteryMonitor.jsx

**Path:** `client/src/components/BatteryMonitor.jsx`

**Purpose:** Display and control battery level with visual indicator.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onBatteryUpdate` | Function | Callback when battery changes |

### Features
- **Visual Indicator:** Color-coded battery icon
- **Percentage Display:** Shows current battery %
- **Slider Control:** Manual adjustment for testing
- **Auto-decrement:** Simulates battery drain every 10s

### Battery Colors
- **Green:** 100-51%
- **Orange:** 50-21%
- **Yellow:** 20-11%
- **Red:** 10-0%

### Example Usage
```jsx
<BatteryMonitor onBatteryUpdate={setBatteryLevel} />
```

---

## ReservationPanel.jsx

**Path:** `client/src/components/ReservationPanel.jsx`

**Purpose:** Display reservation details with QR code.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `reservationId` | Number | ID of the reservation |
| `onClose` | Function | Callback to close panel |

### Features
- **QR Code:** Large, scannable QR code
- **Charger Details:** Name, location, slot number
- **Countdown Timer:** Time remaining before expiry
- **Close Button:** Dismiss reservation panel

### Data Retrieved
Fetches reservation details via `/api/reservation/:id`:
- Charger name and location
- QR code image
- Slot number
- Expiry time

### Example Usage
```jsx
<ReservationPanel 
  reservationId={5} 
  onClose={handleCloseReservation} 
/>
```

---

## EmergencyOverlay.jsx

**Path:** `client/src/components/EmergencyOverlay.jsx`

**Purpose:** Full-screen emergency alert overlay.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `active` | Boolean | Show/hide overlay |

### Features
- **Pulsing Animation:** Red background pulse effect
- **Warning Icon:** Large battery icon
- **Emergency Message:** Clear emergency text
- **Auto-dismiss:** Disappears after 2 seconds

### Styling
- Full-screen overlay (z-index: 9999)
- Red background with pulsing animation
- Semi-transparent backdrop

### Example Usage
```jsx
<EmergencyOverlay active={emergencyActive} />
```

---

## SmartAssistantPanel.jsx

**Path:** `client/src/components/SmartAssistantPanel.jsx`

**Purpose:** AI-powered assistant panel with recommendations.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `battery` | Number | Current battery level |
| `reservationStatus` | String | Status of reservation |
| `nearestCharger` | Object | Nearest available charger |

### Features
- **Status Messages:** Context-aware recommendations
- **Battery Info:** Current battery status
- **Charger Suggestions:** Nearest charger information
- **Smart Tips:** AI-generated guidance

### Status Messages
- Battery > 50%: "All systems optimal"
- Battery 21-50%: "Monitor battery levels"
- Battery ≤ 20%: "Low battery warning"
- Active reservation: "Navigate to charger"

### Example Usage
```jsx
<SmartAssistantPanel 
  battery={25} 
  reservationStatus="active"
  nearestCharger={chargerData} 
/>
```

---

## SmartTimeline.jsx

**Path:** `client/src/components/SmartTimeline.jsx`

**Purpose:** Visual timeline of charging process.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `status` | String | Current reservation status |

### Features
- **4-Step Timeline:** Detection → Booking → Navigation → Charging
- **Progress Indicator:** Highlights current step
- **Icons:** Visual representation of each step
- **Descriptions:** Brief text for each stage

### Timeline Steps
1. **Detection:** Battery monitoring
2. **Booking:** Charger reservation
3. **Navigation:** Route to charger
4. **Charging:** Active charging session

### Example Usage
```jsx
<SmartTimeline status="active" />
```

---

## AdminPanel.jsx

**Path:** `client/src/components/AdminPanel.jsx`

**Purpose:** Administrative dashboard for managing chargers.

### Features
- **Charger List:** View all charging stations
- **Toggle Availability:** Enable/disable chargers
- **Reservation Stats:** Active reservations count
- **Real-time Updates:** Socket.IO integration

### Actions
- Toggle charger on/off
- View charger details
- Monitor system status

### Example Usage
```jsx
<AdminPanel />
```

---

## GateScanner.jsx

**Path:** `client/src/components/GateScanner.jsx`

**Purpose:** QR code verification interface.

### Features
- **Token Input:** Manual token entry field
- **Verification Button:** Submit token for validation
- **Status Messages:** Success/error feedback
- **Auto-Redirect:** Returns to home after success

### Verification Flow
1. User enters token hash
2. System sends to `/api/qr/verify`
3. Server validates token
4. Display result (access granted/denied)

### Example Usage
```jsx
<GateScanner />
```

---

## Navbar.jsx

**Path:** `client/src/components/Navbar.jsx`

**Purpose:** Top navigation bar.

### Features
- **App Title:** "Smart EV Routing"
- **Navigation Links:** Home, Admin, Scanner
- **Glassmorphism:** Frosted glass effect
- **Sticky Position:** Fixed to top

### Example Usage
```jsx
<Navbar />
```

---

## Sidebar.jsx

**Path:** `client/src/components/Sidebar.jsx`

**Purpose:** Side navigation panel.

### Features
- **Quick Links:** Main pages
- **Icons:** Visual navigation
- **Responsive:** Collapsible on mobile

### Example Usage
```jsx
<Sidebar />
```

---

## Styling Patterns

All components follow these design principles:

### Glassmorphism
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Animations
```css
.anim-slide-up {
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Color Scheme
- Primary: `#ff8c00` (Orange)
- Background: `#0a0a0a` (Dark)
- Text: `#ffffff` (White)
- Secondary: `rgba(255, 255, 255, 0.7)`

---

## Best Practices

1. **State Management:** Use React hooks for local state
2. **Props Validation:** Always validate prop types
3. **Error Handling:** Wrap API calls in try-catch
4. **Loading States:** Show spinners during async operations
5. **Accessibility:** Add ARIA labels and semantic HTML
6. **Responsive Design:** Test on multiple screen sizes
7. **Performance:** Use React.memo for expensive components
