// Solar Calculator - JavaScript File

class SolarCalculator {
    constructor() {
        this.selectedAppliances = [];
        this.customAppliances = [];
        this.initializeEventListeners();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Navigation
        document.getElementById('backToMainBtn').addEventListener('click', () => {
            window.location.href = '/';
        });

        // Calculate load button
        document.getElementById('calculateLoadBtn').addEventListener('click', () => {
            this.calculateTotalLoad();
        });

        // Add custom appliance
        document.getElementById('addCustomAppliance').addEventListener('click', () => {
            this.addCustomAppliance();
        });

        // Location change
        document.getElementById('calculatorLocation').addEventListener('change', () => {
            const selectedCity = document.getElementById('calculatorLocation').value;
            
            // Update current city display
            this.updateCurrentCityDisplay(selectedCity);
            
            // Update manual input
            document.getElementById('manualCityInput').value = selectedCity;
            
            // Clear active city button
            document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));
            
            // If we have appliances selected, recalculate solar requirements
            if (this.selectedAppliances.length > 0) {
                this.calculateSolarRequirements();
            }
        });

        // City button clicks - Add this new functionality
        document.querySelectorAll('.city-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const city = btn.getAttribute('data-city');
                document.getElementById('calculatorLocation').value = city;
                document.getElementById('manualCityInput').value = city;
                
                // Update current city display
                this.updateCurrentCityDisplay(city);
                
                // Update active button state
                document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // If we have appliances selected, recalculate solar requirements
                if (this.selectedAppliances.length > 0) {
                    this.calculateSolarRequirements();
                }
                
                // Show success message
                this.showMessage(`Location changed to ${city}!`, 'success');
            });
        });

        // Manual city input and set button
        document.getElementById('setCustomCityBtn').addEventListener('click', () => {
            const customCity = document.getElementById('manualCityInput').value.trim();
            if (customCity) {
                if (customCity.length < 2) {
                    this.showMessage('City name must be at least 2 characters long.', 'error');
                    return;
                }
                
                if (customCity.length > 50) {
                    this.showMessage('City name is too long. Please use a shorter name.', 'error');
                    return;
                }
                
                // Clear active city button
                document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));
                
                // Set the custom city
                this.setCustomCity(customCity);
                this.showMessage(`Custom city set to ${customCity}!`, 'success');
            } else {
                this.showMessage('Please enter a city name.', 'error');
            }
        });

        // Enter key support for manual city input
        document.getElementById('manualCityInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('setCustomCityBtn').click();
            }
        });

        // Appliance selection
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateApplianceSelection();
            });
        });

        // Quantity changes
        document.querySelectorAll('.quantity').forEach(input => {
            input.addEventListener('change', () => {
                this.updateApplianceSelection();
            });
        });

        // Custom wattage changes
        document.querySelectorAll('.custom-watt').forEach(input => {
            input.addEventListener('change', () => {
                this.updateApplianceSelection();
            });
        });

        // Event delegation for remove custom appliance buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-custom-appliance')) {
                const applianceItem = e.target.closest('.custom-appliance-item');
                const applianceId = parseInt(applianceItem.dataset.id);
                this.removeCustomAppliance(applianceId);
            }
        });

        // Remove all custom appliances button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#removeAllCustomAppliances')) {
                this.removeAllCustomAppliances();
            }
        });
    }

    // Update current city display
    updateCurrentCityDisplay(cityName) {
        const displayCityName = document.getElementById('displayCityName');
        if (displayCityName) {
            displayCityName.textContent = cityName;
        }
    }

    // Set custom city
    setCustomCity(cityName) {
        // Update the manual input
        document.getElementById('manualCityInput').value = cityName;
        
        // Update the current city display
        this.updateCurrentCityDisplay(cityName);
        
        // Try to find a matching city in the dropdown
        const dropdown = document.getElementById('calculatorLocation');
        const matchingOption = Array.from(dropdown.options).find(option => 
            option.value.toLowerCase() === cityName.toLowerCase()
        );
        
        if (matchingOption) {
            dropdown.value = matchingOption.value;
        } else {
            // If no exact match, add it as a custom option
            const customOption = new Option(cityName, cityName);
            dropdown.add(customOption);
            dropdown.value = cityName;
        }
        
        // If we have appliances selected, recalculate solar requirements
        if (this.selectedAppliances.length > 0) {
            this.calculateSolarRequirements();
        }
    }

    // Update appliance selection
    updateApplianceSelection() {
        this.selectedAppliances = [];
        
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            const applianceName = checkbox.getAttribute('data-appliance');
            const defaultWattage = parseInt(checkbox.getAttribute('data-wattage'));
            const hours = parseFloat(checkbox.getAttribute('data-hours'));
            const quantity = parseInt(checkbox.closest('.appliance-item').querySelector('.quantity').value) || 0;
            const customWattInput = checkbox.closest('.appliance-item').querySelector('.custom-watt');
            const customWattage = customWattInput ? parseInt(customWattInput.value) : null;
            
            // Use custom wattage if provided, otherwise use default
            const wattage = customWattage && customWattage > 0 ? customWattage : defaultWattage;
            
            if (quantity > 0) {
                this.selectedAppliances.push({
                    name: applianceName,
                    wattage: wattage,
                    hours: hours,
                    quantity: quantity,
                    dailyConsumption: (wattage * hours * quantity) / 1000, // kWh
                    isCustomWattage: customWattage && customWattage > 0
                });
            }
        });

        // Add custom appliances
        this.selectedAppliances = this.selectedAppliances.concat(this.customAppliances);
    }

    // Add custom appliance
    addCustomAppliance() {
        const name = document.getElementById('customApplianceName').value.trim();
        const wattage = parseInt(document.getElementById('customApplianceWattage').value);
        const hours = parseFloat(document.getElementById('customApplianceHours').value);
        const quantity = parseInt(document.getElementById('customApplianceQuantity').value);

        if (!name || !wattage || !hours || !quantity) {
            this.showMessage('Please fill all fields for custom appliance.', 'error');
            return;
        }

        const customAppliance = {
            name: name,
            wattage: wattage,
            hours: hours,
            quantity: quantity,
            dailyConsumption: (wattage * hours * quantity) / 1000,
            isCustom: true,
            id: Date.now() // Add unique ID for removal
        };

        this.customAppliances.push(customAppliance);
        this.updateApplianceSelection();
        this.displayCustomAppliances(); // Display the updated list

        // Clear form
        document.getElementById('customApplianceName').value = '';
        document.getElementById('customApplianceWattage').value = '';
        document.getElementById('customApplianceHours').value = '';
        document.getElementById('customApplianceQuantity').value = '1';

        this.showMessage(`Custom appliance "${name}" added successfully!`);
    }

    // Display custom appliances list
    displayCustomAppliances() {
        const customAppliancesList = document.getElementById('customAppliancesList');
        const customAppliancesItems = document.getElementById('customAppliancesItems');
        const customAppliancesCount = document.getElementById('customAppliancesCount');
        
        if (this.customAppliances.length === 0) {
            customAppliancesList.style.display = 'none';
            return;
        }

        customAppliancesList.style.display = 'block';
        customAppliancesCount.textContent = this.customAppliances.length;
        
        let html = '';
        this.customAppliances.forEach(appliance => {
            html += `
                <div class="custom-appliance-item" data-id="${appliance.id}">
                    <div class="custom-appliance-info">
                        <span class="custom-appliance-name">${appliance.name}</span>
                        <span class="custom-appliance-details">
                            ${appliance.quantity} × ${appliance.wattage}W × ${appliance.hours}h = ${appliance.dailyConsumption.toFixed(2)} kWh/day
                        </span>
                    </div>
                    <button class="btn btn-secondary remove-custom-appliance">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
        });
        
        customAppliancesItems.innerHTML = html;
    }

    // Remove custom appliance
    removeCustomAppliance(id) {
        // Find the appliance to get its name for confirmation
        const applianceToRemove = this.customAppliances.find(appliance => appliance.id === id);
        
        if (!applianceToRemove) {
            this.showMessage('Appliance not found.', 'error');
            return;
        }
        
        // Ask for confirmation
        if (!confirm(`Are you sure you want to remove "${applianceToRemove.name}"?`)) {
            return;
        }
        
        // Find the appliance item element
        const applianceItem = document.querySelector(`[data-id="${id}"]`);
        
        // Add removal animation
        if (applianceItem) {
            applianceItem.classList.add('removing');
            
            // Wait for animation to complete before removing from array
            setTimeout(() => {
                this.customAppliances = this.customAppliances.filter(appliance => appliance.id !== id);
                this.updateApplianceSelection();
                this.displayCustomAppliances();
                
                // If load summary is currently displayed, recalculate and update it
                const loadSummarySection = document.querySelector('.load-summary-section');
                if (loadSummarySection.style.display !== 'none') {
                    this.calculateTotalLoad();
                }
                
                this.showMessage(`"${applianceToRemove.name}" removed successfully!`);
            }, 300); // Match the CSS animation duration
        } else {
            // Fallback if element not found
            this.customAppliances = this.customAppliances.filter(appliance => appliance.id !== id);
            this.updateApplianceSelection();
            this.displayCustomAppliances();
            this.showMessage(`"${applianceToRemove.name}" removed successfully!`);
        }
    }

    // Remove all custom appliances
    removeAllCustomAppliances() {
        if (this.customAppliances.length === 0) {
            this.showMessage('No custom appliances to remove.', 'info');
            return;
        }

        if (!confirm('Are you sure you want to remove all custom appliances?')) {
            return;
        }

        this.customAppliances = [];
        this.updateApplianceSelection();
        this.displayCustomAppliances();
        this.showMessage('All custom appliances removed successfully!');
    }

    // Calculate total load
    calculateTotalLoad() {
        this.updateApplianceSelection();

        if (this.selectedAppliances.length === 0) {
            this.showMessage('Please select at least one appliance.', 'error');
            return;
        }

        const totalLoad = this.selectedAppliances.reduce((sum, appliance) => {
            return sum + (appliance.wattage * appliance.quantity);
        }, 0);

        const totalDailyConsumption = this.selectedAppliances.reduce((sum, appliance) => {
            return sum + appliance.dailyConsumption;
        }, 0);

        this.displayLoadSummary(totalLoad, totalDailyConsumption);
        this.calculateSolarRequirements();
    }

    // Display load summary
    displayLoadSummary(totalLoad, totalDailyConsumption) {
        const loadSummaryDiv = document.getElementById('loadSummary');
        const loadSummarySection = document.querySelector('.load-summary-section');

        let html = `
            <div class="load-overview">
                <div class="load-stat">
                    <h3>Total Load</h3>
                    <div class="value">${totalLoad.toLocaleString()}</div>
                    <div class="unit">Watts</div>
                </div>
                <div class="load-stat">
                    <h3>Daily Consumption</h3>
                    <div class="value">${totalDailyConsumption.toFixed(2)}</div>
                    <div class="unit">kWh</div>
                </div>
                <div class="load-stat">
                    <h3>Monthly Consumption</h3>
                    <div class="value">${(totalDailyConsumption * 30).toFixed(1)}</div>
                    <div class="unit">kWh</div>
                </div>
            </div>
            <div class="appliance-breakdown">
                <h3>Appliance Breakdown</h3>
                <div class="appliance-list">
        `;

        this.selectedAppliances.forEach(appliance => {
            const totalWattage = appliance.wattage * appliance.quantity;
            const percentage = ((totalWattage / totalLoad) * 100).toFixed(1);
            const wattageLabel = appliance.isCustomWattage ? `${appliance.wattage}W (Custom)` : `${appliance.wattage}W`;
            
            html += `
                <div class="appliance-breakdown-item">
                    <div class="appliance-info">
                        <span class="appliance-name">${appliance.name}</span>
                        <span class="appliance-details">
                            ${appliance.quantity} × ${wattageLabel} × ${appliance.hours}h = ${appliance.dailyConsumption.toFixed(2)} kWh/day
                        </span>
                    </div>
                    <div class="appliance-percentage">
                        <div class="percentage-bar">
                            <div class="percentage-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span class="percentage-text">${percentage}%</span>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        loadSummaryDiv.innerHTML = html;
        loadSummarySection.style.display = 'block';
    }

    // Calculate solar requirements
    async calculateSolarRequirements() {
        if (this.selectedAppliances.length === 0) return;

        this.showLoading();

        try {
            const location = document.getElementById('calculatorLocation').value;
            const totalDailyConsumption = this.selectedAppliances.reduce((sum, appliance) => {
                return sum + appliance.dailyConsumption;
            }, 0);

            // Get location-specific solar data
            const response = await fetch(`http://localhost:5000/api/solar/calculator-requirements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: location,
                    dailyConsumption: totalDailyConsumption,
                    appliances: this.selectedAppliances
                })
            });

            if (!response.ok) {
                throw new Error('Failed to calculate solar requirements');
            }

            const result = await response.json();
            this.displaySolarRequirements(result.data);
            
            // Also fetch and display city-specific solar potential
            this.fetchCitySolarPotential(location);
            
            this.hideLoading();

        } catch (error) {
            this.hideLoading();
            console.error('Solar Calculator Error:', error);
            
            // Fallback calculation
            const fallbackResult = this.calculateFallbackRequirements();
            this.displaySolarRequirements(fallbackResult);
            this.showMessage('Using local calculations.', 'error');
        }
    }

    // Fetch city-specific solar potential
    async fetchCitySolarPotential(location) {
        try {
            const response = await fetch(`http://localhost:5000/api/solar/maharashtra-potential`);
            if (response.ok) {
                const result = await response.json();
                const cityData = result.data[location];
                if (cityData) {
                    this.displayCitySolarPotential(location, cityData);
                }
            }
        } catch (error) {
            console.log('Could not fetch city solar potential');
        }
    }

    // Display city-specific solar potential
    displayCitySolarPotential(location, cityData) {
        const solarRequirementsSection = document.querySelector('.solar-requirements-section');
        if (solarRequirementsSection) {
            const cityPotentialDiv = document.createElement('div');
            cityPotentialDiv.className = 'city-solar-potential';
            cityPotentialDiv.innerHTML = `
                <div class="potential-header">
                    <h3><i class="fas fa-sun"></i> Solar Potential for ${location}</h3>
                </div>
                <div class="potential-grid">
                    <div class="potential-item">
                        <h4>Annual Irradiance</h4>
                        <div class="value">${cityData.annualIrradiance}</div>
                    </div>
                    <div class="potential-item">
                        <h4>Peak Sun Hours</h4>
                        <div class="value">${cityData.peakSunHours}</div>
                    </div>
                    <div class="potential-item">
                        <h4>Monsoon Impact</h4>
                        <div class="value">${cityData.monsoonImpact}</div>
                    </div>
                    <div class="potential-item">
                        <h4>Best Season</h4>
                        <div class="value">${cityData.bestSeason}</div>
                    </div>
                    <div class="potential-item">
                        <h4>Solar Class</h4>
                        <div class="value">${cityData.solarClass}</div>
                    </div>
                </div>
            `;
            
            // Insert after the solar requirements
            const solarRequirementsDiv = document.getElementById('solarRequirements');
            solarRequirementsDiv.appendChild(cityPotentialDiv);
        }
    }

    // Calculate fallback requirements
    calculateFallbackRequirements() {
        const location = document.getElementById('calculatorLocation').value;
        const totalDailyConsumption = this.selectedAppliances.reduce((sum, appliance) => {
            return sum + appliance.dailyConsumption;
        }, 0);

        // Maharashtra solar potential data - All 36 Districts
        const locationData = {
            'Mumbai': { peakSunHours: 5.2, efficiency: 0.75 },
            'Pune': { peakSunHours: 5.5, efficiency: 0.78 },
            'Nagpur': { peakSunHours: 5.8, efficiency: 0.82 },
            'Nashik': { peakSunHours: 5.3, efficiency: 0.76 },
            'Aurangabad': { peakSunHours: 5.4, efficiency: 0.79 },
            'Solapur': { peakSunHours: 5.9, efficiency: 0.84 },
            'Kolhapur': { peakSunHours: 5.1, efficiency: 0.73 },
            'Amravati': { peakSunHours: 5.6, efficiency: 0.80 },
            'Ahmednagar': { peakSunHours: 5.4, efficiency: 0.77 },
            'Akola': { peakSunHours: 5.7, efficiency: 0.81 },
            'Bhandara': { peakSunHours: 5.6, efficiency: 0.80 },
            'Beed': { peakSunHours: 5.5, efficiency: 0.78 },
            'Buldhana': { peakSunHours: 5.6, efficiency: 0.79 },
            'Chandrapur': { peakSunHours: 5.7, efficiency: 0.81 },
            'Dhule': { peakSunHours: 5.4, efficiency: 0.77 },
            'Gadchiroli': { peakSunHours: 5.5, efficiency: 0.78 },
            'Gondia': { peakSunHours: 5.6, efficiency: 0.80 },
            'Hingoli': { peakSunHours: 5.5, efficiency: 0.78 },
            'Jalgaon': { peakSunHours: 5.5, efficiency: 0.78 },
            'Jalna': { peakSunHours: 5.4, efficiency: 0.77 },
            'Latur': { peakSunHours: 5.6, efficiency: 0.79 },
            'Mumbai Suburban': { peakSunHours: 5.2, efficiency: 0.75 },
            'Nanded': { peakSunHours: 5.5, efficiency: 0.78 },
            'Nashik Rural': { peakSunHours: 5.3, efficiency: 0.76 },
            'Osmanabad': { peakSunHours: 5.5, efficiency: 0.78 },
            'Palghar': { peakSunHours: 5.3, efficiency: 0.76 },
            'Parbhani': { peakSunHours: 5.4, efficiency: 0.77 },
            'Raigad': { peakSunHours: 5.3, efficiency: 0.76 },
            'Ratnagiri': { peakSunHours: 5.1, efficiency: 0.74 },
            'Sangli': { peakSunHours: 5.2, efficiency: 0.75 },
            'Satara': { peakSunHours: 5.3, efficiency: 0.76 },
            'Sindhudurg': { peakSunHours: 5.0, efficiency: 0.73 },
            'Thane': { peakSunHours: 5.2, efficiency: 0.75 },
            'Wardha': { peakSunHours: 5.6, efficiency: 0.80 },
            'Washim': { peakSunHours: 5.5, efficiency: 0.78 },
            'Yavatmal': { peakSunHours: 5.6, efficiency: 0.80 },
            'Nandurbar': { peakSunHours: 5.4, efficiency: 0.77 }
        };

        const data = locationData[location] || locationData['Mumbai'];
        
        // Calculate required solar capacity
        const requiredCapacity = totalDailyConsumption / (data.peakSunHours * data.efficiency);
        const panelCapacity = 400; // W per panel
        const numberOfPanels = Math.ceil(requiredCapacity * 1000 / panelCapacity);
        const actualCapacity = (numberOfPanels * panelCapacity) / 1000; // kW

        return {
            location: location,
            dailyConsumption: totalDailyConsumption,
            requiredCapacity: requiredCapacity,
            numberOfPanels: numberOfPanels,
            panelCapacity: panelCapacity,
            actualCapacity: actualCapacity,
            peakSunHours: data.peakSunHours,
            efficiency: data.efficiency,
            estimatedGeneration: actualCapacity * data.peakSunHours * data.efficiency,
            costEstimate: numberOfPanels * 50000, // ₹50,000 per panel
            paybackPeriod: (numberOfPanels * 50000) / (totalDailyConsumption * 8 * 365) // 8 INR per kWh
        };
    }

    // Display solar requirements
    displaySolarRequirements(data) {
        const solarRequirementsDiv = document.getElementById('solarRequirements');
        const solarRequirementsSection = document.querySelector('.solar-requirements-section');

        const html = `
            <div class="solar-overview">
                <div class="solar-stat">
                    <h3>Required Solar Capacity</h3>
                    <div class="value">${data.requiredCapacity.toFixed(2)}</div>
                    <div class="unit">kW</div>
                </div>
                <div class="solar-stat">
                    <h3>Number of Panels</h3>
                    <div class="value">${data.numberOfPanels}</div>
                    <div class="unit">Panels (${data.panelCapacity}W each)</div>
                </div>
                <div class="solar-stat">
                    <h3>Actual Capacity</h3>
                    <div class="value">${data.actualCapacity.toFixed(2)}</div>
                    <div class="unit">kW</div>
                </div>
                <div class="solar-stat">
                    <h3>Daily Generation</h3>
                    <div class="value">${data.estimatedGeneration.toFixed(2)}</div>
                    <div class="unit">kWh</div>
                </div>
            </div>
            
            <div class="solar-details">
                <div class="detail-section">
                    <h3>Location Details</h3>
                    <div class="detail-item">
                        <span>Location:</span>
                        <span>${data.location}</span>
                    </div>
                    <div class="detail-item">
                        <span>Peak Sun Hours:</span>
                        <span>${data.peakSunHours} hours/day</span>
                    </div>
                    <div class="detail-item">
                        <span>System Efficiency:</span>
                        <span>${(data.efficiency * 100).toFixed(1)}%</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Financial Analysis</h3>
                    <div class="detail-item">
                        <span>Estimated Cost:</span>
                        <span>₹${data.costEstimate.toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span>Daily Savings:</span>
                        <span>₹${(data.estimatedGeneration * 8).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span>Payback Period:</span>
                        <span>${data.paybackPeriod.toFixed(1)} years</span>
                    </div>
                </div>
            </div>
        `;

        solarRequirementsDiv.innerHTML = html;
        solarRequirementsSection.style.display = 'block';
    }

    // Show loading modal
    showLoading() {
        document.getElementById('loadingModal').style.display = 'block';
    }

    // Hide loading modal
    hideLoading() {
        document.getElementById('loadingModal').style.display = 'none';
    }

    // Show message
    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Insert after header
        const header = document.querySelector('.header');
        header.parentNode.insertBefore(messageDiv, header.nextSibling);
        
        // Remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.solarCalculator = new SolarCalculator();
    
    // Initialize default city display
    const defaultCity = document.getElementById('calculatorLocation').value;
    if (defaultCity) {
        window.solarCalculator.updateCurrentCityDisplay(defaultCity);
    }
    
    // Show welcome message
    setTimeout(() => {
        window.solarCalculator.showMessage('Welcome to Solar Calculator! Select your appliances and location to get started.', 'info');
    }, 1000);
}); 