/**
 * Driving School, Instructors, Vehicles, and Packages Service
 *
 * NOTE FOR SUPABASE MIGRATION:
 * Replace functions with:
 *   await supabase.from('schools').select('*, instructors(*), vehicles(*), packages(*)').eq('is_active', true);
 */
import { Storage } from './storage';
import {
  School,
  Instructor,
  Vehicle,
  Package,
  AvailabilityRule,
  TimeOff,
  Review,
  VadodaraArea,
  VehicleType,
} from '../types';

export interface SchoolFilterOptions {
  area?: VadodaraArea | 'All';
  vehicleType?: VehicleType | 'All';
  femaleInstructorOnly?: boolean;
  automaticOnly?: boolean;
  weekendSlotsOnly?: boolean;
  minRating?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: 'rating' | 'priceAsc' | 'priceDesc' | 'popular';
}

export const SchoolService = {
  async getSchools(filters?: SchoolFilterOptions): Promise<School[]> {
    let schools = Storage.get<School[]>(Storage.KEYS.SCHOOLS, []);
    const instructors = Storage.get<Instructor[]>(Storage.KEYS.INSTRUCTORS, []);
    const vehicles = Storage.get<Vehicle[]>(Storage.KEYS.VEHICLES, []);
    const packages = Storage.get<Package[]>(Storage.KEYS.PACKAGES, []);
    const availability = Storage.get<AvailabilityRule[]>(Storage.KEYS.AVAILABILITY, []);

    // Filter active and approved
    schools = schools.filter((s) => s.is_active && s.status === 'approved');

    if (!filters) return schools;

    // Search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      schools = schools.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // Area filter
    if (filters.area && filters.area !== 'All') {
      schools = schools.filter((s) => s.area === filters.area);
    }

    // Vehicle Type filter
    if (filters.vehicleType && filters.vehicleType !== 'All') {
      schools = schools.filter((s) => {
        const schoolVehicles = vehicles.filter((v) => v.school_id === s.id && v.is_active);
        return schoolVehicles.some((v) => v.vehicle_type === filters.vehicleType);
      });
    }

    // Female Instructor Only
    if (filters.femaleInstructorOnly) {
      schools = schools.filter((s) => {
        const schoolInstructors = instructors.filter((i) => i.school_id === s.id && i.is_active);
        return schoolInstructors.some((i) => i.gender === 'female');
      });
    }

    // Automatic Only
    if (filters.automaticOnly) {
      schools = schools.filter((s) => {
        const schoolVehicles = vehicles.filter((v) => v.school_id === s.id && v.is_active);
        return schoolVehicles.some((v) => v.vehicle_type === 'car_automatic');
      });
    }

    // Weekend Slots Only
    if (filters.weekendSlotsOnly) {
      schools = schools.filter((s) => {
        const schoolRules = availability.filter((r) => r.school_id === s.id);
        return schoolRules.some((r) => r.weekday === 0 || r.weekday === 6);
      });
    }

    // Min Rating
    if (filters.minRating && filters.minRating > 0) {
      schools = schools.filter((s) => s.rating >= (filters.minRating || 0));
    }

    // Max Price filter (based on starting package price)
    if (filters.maxPrice && filters.maxPrice > 0) {
      schools = schools.filter((s) => {
        const schoolPackages = packages.filter((p) => p.school_id === s.id && p.is_active);
        if (schoolPackages.length === 0) return true;
        const minPrice = Math.min(...schoolPackages.map((p) => p.price_inr));
        return minPrice <= filters.maxPrice!;
      });
    }

    // Sorting
    if (filters.sortBy) {
      if (filters.sortBy === 'rating') {
        schools.sort((a, b) => b.rating - a.rating);
      } else if (filters.sortBy === 'popular') {
        schools.sort((a, b) => b.review_count - a.review_count);
      } else if (filters.sortBy === 'priceAsc' || filters.sortBy === 'priceDesc') {
        const getMinPkgPrice = (schoolId: string) => {
          const pkgs = packages.filter((p) => p.school_id === schoolId && p.is_active);
          return pkgs.length > 0 ? Math.min(...pkgs.map((p) => p.price_inr)) : 0;
        };
        schools.sort((a, b) => {
          const pA = getMinPkgPrice(a.id);
          const pB = getMinPkgPrice(b.id);
          return filters.sortBy === 'priceAsc' ? pA - pB : pB - pA;
        });
      }
    }

    return schools;
  },

  async getAllSchoolsForAdmin(): Promise<School[]> {
    return Storage.get<School[]>(Storage.KEYS.SCHOOLS, []);
  },

  async getSchoolById(id: string): Promise<{
    school: School;
    instructors: Instructor[];
    vehicles: Vehicle[];
    packages: Package[];
    reviews: Review[];
  } | null> {
    const schools = Storage.get<School[]>(Storage.KEYS.SCHOOLS, []);
    const school = schools.find((s) => s.id === id);
    if (!school) return null;

    const instructors = Storage.get<Instructor[]>(Storage.KEYS.INSTRUCTORS, []).filter(
      (i) => i.school_id === id && i.is_active
    );
    const vehicles = Storage.get<Vehicle[]>(Storage.KEYS.VEHICLES, []).filter(
      (v) => v.school_id === id && v.is_active
    );
    const packages = Storage.get<Package[]>(Storage.KEYS.PACKAGES, []).filter(
      (p) => p.school_id === id && p.is_active
    );
    const reviews = Storage.get<Review[]>(Storage.KEYS.REVIEWS, []).filter(
      (r) => r.school_id === id && !r.is_flagged
    );

    return { school, instructors, vehicles, packages, reviews };
  },

  async updateSchool(schoolId: string, updates: Partial<School>): Promise<School> {
    const schools = Storage.get<School[]>(Storage.KEYS.SCHOOLS, []);
    const idx = schools.findIndex((s) => s.id === schoolId);
    if (idx === -1) throw new Error('School not found');

    const updated = { ...schools[idx], ...updates };
    schools[idx] = updated;
    Storage.set(Storage.KEYS.SCHOOLS, schools);
    return updated;
  },

  async addSchool(school: Omit<School, 'id' | 'created_at'>): Promise<School> {
    const schools = Storage.get<School[]>(Storage.KEYS.SCHOOLS, []);
    const newSchool: School = {
      ...school,
      id: `school_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    schools.push(newSchool);
    Storage.set(Storage.KEYS.SCHOOLS, schools);
    return newSchool;
  },

  // Instructors
  async getInstructors(schoolId: string): Promise<Instructor[]> {
    return Storage.get<Instructor[]>(Storage.KEYS.INSTRUCTORS, []).filter(
      (i) => i.school_id === schoolId
    );
  },

  async addInstructor(instructor: Omit<Instructor, 'id'>): Promise<Instructor> {
    const instructors = Storage.get<Instructor[]>(Storage.KEYS.INSTRUCTORS, []);
    const newInst: Instructor = {
      ...instructor,
      id: `inst_${Date.now()}`,
    };
    instructors.push(newInst);
    Storage.set(Storage.KEYS.INSTRUCTORS, instructors);
    return newInst;
  },

  async updateInstructor(id: string, updates: Partial<Instructor>): Promise<Instructor> {
    const instructors = Storage.get<Instructor[]>(Storage.KEYS.INSTRUCTORS, []);
    const idx = instructors.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Instructor not found');
    const updated = { ...instructors[idx], ...updates };
    instructors[idx] = updated;
    Storage.set(Storage.KEYS.INSTRUCTORS, instructors);
    return updated;
  },

  // Vehicles
  async getVehicles(schoolId: string): Promise<Vehicle[]> {
    return Storage.get<Vehicle[]>(Storage.KEYS.VEHICLES, []).filter((v) => v.school_id === schoolId);
  },

  async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const vehicles = Storage.get<Vehicle[]>(Storage.KEYS.VEHICLES, []);
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `veh_${Date.now()}`,
    };
    vehicles.push(newVehicle);
    Storage.set(Storage.KEYS.VEHICLES, vehicles);
    return newVehicle;
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const vehicles = Storage.get<Vehicle[]>(Storage.KEYS.VEHICLES, []);
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('Vehicle not found');
    const updated = { ...vehicles[idx], ...updates };
    vehicles[idx] = updated;
    Storage.set(Storage.KEYS.VEHICLES, vehicles);
    return updated;
  },

  // Packages
  async getPackages(schoolId: string): Promise<Package[]> {
    return Storage.get<Package[]>(Storage.KEYS.PACKAGES, []).filter((p) => p.school_id === schoolId);
  },

  async addPackage(pkg: Omit<Package, 'id'>): Promise<Package> {
    const packages = Storage.get<Package[]>(Storage.KEYS.PACKAGES, []);
    const newPkg: Package = {
      ...pkg,
      id: `pkg_${Date.now()}`,
    };
    packages.push(newPkg);
    Storage.set(Storage.KEYS.PACKAGES, packages);
    return newPkg;
  },

  async updatePackage(id: string, updates: Partial<Package>): Promise<Package> {
    const packages = Storage.get<Package[]>(Storage.KEYS.PACKAGES, []);
    const idx = packages.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Package not found');
    const updated = { ...packages[idx], ...updates };
    packages[idx] = updated;
    Storage.set(Storage.KEYS.PACKAGES, packages);
    return updated;
  },

  // Availability & Time Off
  async getAvailability(schoolId: string): Promise<AvailabilityRule[]> {
    return Storage.get<AvailabilityRule[]>(Storage.KEYS.AVAILABILITY, []).filter(
      (a) => a.school_id === schoolId
    );
  },

  async saveAvailabilityRules(rules: AvailabilityRule[]): Promise<void> {
    const all = Storage.get<AvailabilityRule[]>(Storage.KEYS.AVAILABILITY, []);
    const schoolId = rules[0]?.school_id;
    if (!schoolId) return;

    // Filter out existing rules for this school and append updated rules
    const others = all.filter((r) => r.school_id !== schoolId);
    Storage.set(Storage.KEYS.AVAILABILITY, [...others, ...rules]);
  },

  async getTimeOff(schoolId: string): Promise<TimeOff[]> {
    return Storage.get<TimeOff[]>(Storage.KEYS.TIMEOFF, []).filter((t) => t.school_id === schoolId);
  },

  async addTimeOff(entry: Omit<TimeOff, 'id'>): Promise<TimeOff> {
    const timeoffs = Storage.get<TimeOff[]>(Storage.KEYS.TIMEOFF, []);
    const newEntry: TimeOff = {
      ...entry,
      id: `timeoff_${Date.now()}`,
    };
    timeoffs.push(newEntry);
    Storage.set(Storage.KEYS.TIMEOFF, timeoffs);
    return newEntry;
  },

  async deleteTimeOff(id: string): Promise<void> {
    const timeoffs = Storage.get<TimeOff[]>(Storage.KEYS.TIMEOFF, []);
    Storage.set(
      Storage.KEYS.TIMEOFF,
      timeoffs.filter((t) => t.id !== id)
    );
  },
};
