export interface LocationStateData {
  name: string;
  type: 'State' | 'UT';
  districts: string[];
}

export const INDIA_STATES_AND_UTS: LocationStateData[] = [
  // 28 STATES
  {
    name: 'Andhra Pradesh',
    type: 'State',
    districts: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada', 'Nellore', 'Kurnool', 'Anantapur', 'Rajahmundry', 'Eluru', 'Kadapa', 'Ongole', 'Vizianagaram', 'Srikakulam', 'Chittoor']
  },
  {
    name: 'Arunachal Pradesh',
    type: 'State',
    districts: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Tezu', 'Namsai', 'Bomdila', 'Changlang']
  },
  {
    name: 'Assam',
    type: 'State',
    districts: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Cachar', 'Kamrup']
  },
  {
    name: 'Bihar',
    type: 'State',
    districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger']
  },
  {
    name: 'Chhattisgarh',
    type: 'State',
    districts: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur', 'Raigarh']
  },
  {
    name: 'Goa',
    type: 'State',
    districts: ['North Goa (Panaji)', 'South Goa (Margao)', 'Vasco da Gama', 'Mapusa', 'Ponda']
  },
  {
    name: 'Gujarat',
    type: 'State',
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Bharuch', 'Navsari', 'Morbi', 'Mehsana', 'Kutch (Bhuj)']
  },
  {
    name: 'Haryana',
    type: 'State',
    districts: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Rewari']
  },
  {
    name: 'Himachal Pradesh',
    type: 'State',
    districts: ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Baddi', 'Kullu', 'Hamirpur', 'Una', 'Bilaspur', 'Kangra']
  },
  {
    name: 'Jharkhand',
    type: 'State',
    districts: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Chaibasa']
  },
  {
    name: 'Karnataka',
    type: 'State',
    districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Ballari', 'Tumakuru', 'Shivamogga', 'Davangere', 'Udupi']
  },
  {
    name: 'Kerala',
    type: 'State',
    districts: ['Thiruvananthapuram', 'Kochi (Ernakulam)', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad', 'Malappuram', 'Pathanamthitta', 'Wayanad', 'Idukki', 'Kasaragod']
  },
  {
    name: 'Madhya Pradesh',
    type: 'State',
    districts: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Singrauli', 'Pithampur']
  },
  {
    name: 'Maharashtra',
    type: 'State',
    districts: ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Solapur', 'Amravati', 'Kolhapur', 'Navi Mumbai', 'Tarapur', 'PCMC (Pimpri-Chinchwad)']
  },
  {
    name: 'Manipur',
    type: 'State',
    districts: ['Imphal East', 'Imphal West', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati', 'Ukhrul']
  },
  {
    name: 'Meghalaya',
    type: 'State',
    districts: ['Shillong (East Khasi Hills)', 'Tura (West Garo Hills)', 'Jowai (West Jaintia Hills)', 'Nongpoh (Ri-Bhoi)', 'Baghmara']
  },
  {
    name: 'Mizoram',
    type: 'State',
    districts: ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip']
  },
  {
    name: 'Nagaland',
    type: 'State',
    districts: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon']
  },
  {
    name: 'Odisha',
    type: 'State',
    districts: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Angul', 'Jharsuguda', 'Paradeep']
  },
  {
    name: 'Punjab',
    type: 'State',
    districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali (SAS Nagar)', 'Bathinda', 'Pathankot', 'Hoshiarpur', 'Phagwara']
  },
  {
    name: 'Rajasthan',
    type: 'State',
    districts: ['Jaipur', 'Jodhpur', 'Kota', 'Bhilwara', 'Udaipur', 'Ajmer', 'Bikaner', 'Alwar (Bhiwadi)', 'Neemrana', 'Sikar', 'Sri Ganganagar']
  },
  {
    name: 'Sikkim',
    type: 'State',
    districts: ['Gangtok (East Sikkim)', 'Namchi (South Sikkim)', 'Geyzing (West Sikkim)', 'Mangan (North Sikkim)']
  },
  {
    name: 'Tamil Nadu',
    type: 'State',
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Hosur', 'Kanchipuram', 'Chengalpattu']
  },
  {
    name: 'Telangana',
    type: 'State',
    districts: ['Hyderabad', 'Medchal-Malkajgiri', 'Rangareddy', 'Warangal', 'Karimnagar', 'Khammam', 'Nizamabad', 'Nalgonda', 'Sangareddy', 'Mahbubnagar', 'Peddapalli']
  },
  {
    name: 'Tripura',
    type: 'State',
    districts: ['Agartala (West Tripura)', 'Dharmanagar (North Tripura)', 'Udaipur (Gomati)', 'Kailashahar', 'Ambassa']
  },
  {
    name: 'Uttar Pradesh',
    type: 'State',
    districts: ['Noida / Greater Noida', 'Ghaziabad', 'Kanpur', 'Lucknow', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Mathura', 'Saharanpur']
  },
  {
    name: 'Uttarakhand',
    type: 'State',
    districts: ['Dehradun', 'Haridwar', 'Pantnagar (Udham Singh Nagar)', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital']
  },
  {
    name: 'West Bengal',
    type: 'State',
    districts: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Haldia', 'Kharagpur', 'Hooghly', 'North 24 Parganas', 'South 24 Parganas']
  },

  // 8 UNION TERRITORIES
  {
    name: 'Andaman and Nicobar Islands',
    type: 'UT',
    districts: ['Port Blair (South Andaman)', 'North and Middle Andaman', 'Nicobar']
  },
  {
    name: 'Chandigarh',
    type: 'UT',
    districts: ['Chandigarh City', 'Industrial Area Phase 1 & 2']
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'UT',
    districts: ['Daman', 'Diu', 'Silvassa (Dadra & Nagar Haveli)']
  },
  {
    name: 'Delhi (NCT)',
    type: 'UT',
    districts: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Okhla Industrial Area', 'Bawana', 'Narela']
  },
  {
    name: 'Jammu and Kashmir',
    type: 'UT',
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua', 'Pulwama']
  },
  {
    name: 'Ladakh',
    type: 'UT',
    districts: ['Leh', 'Kargil']
  },
  {
    name: 'Lakshadweep',
    type: 'UT',
    districts: ['Kavaratti', 'Agatti', 'Minicoy']
  },
  {
    name: 'Puducherry',
    type: 'UT',
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
  }
];

export const OTHER_OPTION = 'Other / Custom Location';
