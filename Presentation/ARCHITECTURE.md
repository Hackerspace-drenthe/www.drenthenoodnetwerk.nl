# Architectuur Documentatie

## SOLID Architectuur Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        app.js (Entry Point)                      │
│                  - Dependency Injection Container                │
│                  - Application Lifecycle Management              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ initializes & injects
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              PresentationController (PDCA Orchestrator)          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ PLAN → DO → CHECK → ACT                                    │ │
│  │                                                             │ │
│  │ • Plan:  Initialize & Setup                                │ │
│  │ • Do:    Execute Presentation                              │ │
│  │ • Check: Monitor & Validate                                │ │
│  │ • Act:   Optimize & Respond                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────┬──────────────────┬──────────────────┬─────────────────────┘
      │                  │                  │
      │ uses             │ uses             │ uses
      ▼                  ▼                  ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│SlideManager │   │NavigationCtrl│   │SpeechService │
│             │   │              │   │              │
│• Render     │   │• Navigation  │   │• Speak()     │
│• Navigate   │   │• Auto-play   │   │• Pause()     │
│• Track      │   │• Keyboard    │   │• Resume()    │
└─────────────┘   └──────────────┘   └──────────────┘
      │                  │                  
      │ uses             │                  
      ▼                  ▼                  
┌─────────────────────────────────┐
│      config/slides.js           │
│  • Slide Data                   │
│  • Content Configuration         │
└─────────────────────────────────┘
```

## Component Responsibilities

### 1. app.js (Application Layer)
**Single Responsibility**: Application initialization and lifecycle
- Creates all service instances
- Injects dependencies
- Handles application startup/shutdown
- Browser compatibility checks

### 2. PresentationController (Orchestration Layer)
**Single Responsibility**: Coordinate all presentation activities following PDCA
- **Plan**: Setup and initialize all components
- **Do**: Execute presentation actions (speak, navigate)
- **Check**: Monitor metrics and validate state
- **Act**: Respond to events and optimize flow

### 3. SlideManager (Service Layer)
**Single Responsibility**: Manage slide state and DOM rendering
- Render slides to DOM
- Track current slide
- Handle slide transitions
- Provide slide data access

### 4. NavigationController (Controller Layer)
**Single Responsibility**: Handle all navigation logic
- Previous/Next navigation
- Keyboard shortcuts
- Auto-play functionality
- UI state updates

### 5. SpeechService (Service Layer)
**Single Responsibility**: Handle speech synthesis
- Text-to-speech operations
- Voice selection
- Rate/pitch/volume control
- Event callbacks

## Data Flow

```
User Action (Click/Keyboard)
         │
         ▼
NavigationController
         │
         ├──> SlideManager.next()
         │         │
         │         ├──> Update DOM
         │         └──> Trigger onSlideChange()
         │                    │
         │                    ▼
         └──────────> PresentationController
                              │
                              ├──> Check metrics
                              ├──> Update PDCA phase
                              └──> Update UI
```

## PDCA Cycle Implementation

### PLAN Phase
```javascript
_initialize() {
  // 1. Setup dependencies
  // 2. Bind event listeners
  // 3. Validate configuration
  // 4. Preload resources
  this.updatePDCAPhase('Plan');
}
```

### DO Phase
```javascript
async speakCurrentSlide() {
  this.updatePDCAPhase('Do');
  // 1. Get current slide
  // 2. Execute speech
  // 3. Update UI state
  await this.speechService.speak(slide.speechText);
}
```

### CHECK Phase
```javascript
_onSlideChange(slide, index) {
  this.updatePDCAPhase('Check');
  // 1. Track metrics
  // 2. Validate progress
  // 3. Check completion
  // 4. Log analytics
}
```

### ACT Phase
```javascript
_onPresentationComplete() {
  this.updatePDCAPhase('Act');
  // 1. Calculate metrics
  // 2. Log results
  // 3. Trigger completion actions
  // 4. Prepare for next cycle
}
```

## Dependency Injection Pattern

```javascript
// High-level module depends on abstractions, not concrete implementations
class PresentationController {
  constructor(slideManager, navigationController, speechService) {
    // Dependencies injected, not created
    this.slideManager = slideManager;
    this.navigationController = navigationController;
    this.speechService = speechService;
  }
}

// Easy to test with mock objects
const mockSlideManager = { getCurrentSlide: () => ({...}) };
const controller = new PresentationController(mockSlideManager, ...);
```

## Event Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        User Events                            │
└────┬─────────────┬─────────────┬─────────────┬───────────────┘
     │             │             │             │
     │Click Next   │Click Speak  │Change Rate  │Enable Auto-play
     │             │             │             │
     ▼             ▼             ▼             ▼
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Navigate │  │Speak     │  │Speech    │  │Auto-play │
│         │  │          │  │Settings  │  │         │
└────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │            │             │             │
     └────────────┴─────────────┴─────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ PDCA Cycle     │
         │ State Update   │
         └────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ UI Updates     │
         │ • Progress bar │
         │ • Indicators   │
         │ • Buttons      │
         └────────────────┘
```

## Module Dependencies Graph

```
app.js
  ├── PresentationController
  │     ├── SlideManager
  │     │     └── slides.js
  │     ├── NavigationController
  │     │     └── SlideManager
  │     └── SpeechService
  ├── helpers.js
  └── slides.js
```

## Design Patterns Used

### 1. Dependency Injection
- Services are injected into controllers
- Promotes testability and flexibility

### 2. Observer Pattern
- Event callbacks for slide changes
- Speech events (onStart, onEnd, onError)

### 3. Strategy Pattern
- Different navigation strategies (manual, keyboard, auto-play)
- Pluggable speech engines

### 4. Singleton Pattern
- Single application instance
- Single speech synthesis instance

### 5. Module Pattern
- ES6 modules for encapsulation
- Clear public/private interfaces

## Testing Strategy

### Unit Tests
```javascript
// Test SlideManager independently
test('SlideManager.next() moves to next slide', () => {
  const slides = [{ id: 1 }, { id: 2 }];
  const manager = new SlideManager(slides, mockContainer);
  expect(manager.getCurrentIndex()).toBe(0);
  manager.next();
  expect(manager.getCurrentIndex()).toBe(1);
});
```

### Integration Tests
```javascript
// Test controller coordination
test('Clicking next button updates slide and UI', () => {
  const app = new PresentationApp();
  app.init();
  const initialSlide = app.slideManager.getCurrentIndex();
  simulateClick(app.elements.btnNext);
  expect(app.slideManager.getCurrentIndex()).toBe(initialSlide + 1);
});
```

## Performance Considerations

1. **Lazy Loading**: Images loaded on-demand
2. **Preloading**: First slide loaded immediately
3. **Debouncing**: Rate changes debounced
4. **Efficient DOM Updates**: Minimal reflows
5. **Memory Management**: Cleanup on destroy

## Extensibility Points

### Adding New Features

1. **New Slide Types**
   ```javascript
   // Extend SlideManager
   class VideoSlideManager extends SlideManager {
     _createSlideElement(slide) {
       if (slide.type === 'video') {
         // Custom video slide
       }
       return super._createSlideElement(slide);
     }
   }
   ```

2. **New Navigation Modes**
   ```javascript
   // Extend NavigationController
   class GestureNavigationController extends NavigationController {
     _bindEvents() {
       super._bindEvents();
       this._bindGestureEvents();
     }
   }
   ```

3. **Analytics Integration**
   ```javascript
   // Extend PresentationController
   class AnalyticsPresentationController extends PresentationController {
     _onSlideChange(slide, index) {
       super._onSlideChange(slide, index);
       this._sendAnalytics('slide_view', { slide: index });
     }
   }
   ```

## Error Handling

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Try    │
    └───┬────┘
        │
        ├─ Success ──> Continue
        │
        └─ Error ──┐
                   │
                   ▼
            ┌──────────────┐
            │ Error Handler│
            └──────┬───────┘
                   │
                   ├─> Log error
                   ├─> Update UI
                   ├─> Show message
                   └─> Recover state
```

## Browser Compatibility Layer

```javascript
// Feature detection
if (!SpeechService.isSupported()) {
  // Fallback: Show text-only mode
  this._enableTextOnlyMode();
}

// Polyfills loaded conditionally
if (!window.IntersectionObserver) {
  await import('./polyfills/intersection-observer.js');
}
```

---

**Deze architectuur zorgt voor:**
- ✅ Onderhoudbaarheid
- ✅ Testbaarheid
- ✅ Schaalbaarheid
- ✅ Flexibiliteit
- ✅ Herbruikbaarheid
