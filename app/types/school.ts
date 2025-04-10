export interface SchoolData {
  name: string;
  address: string;
  teachers_room_num: string;
  admin_room_num: string;
  team: string;
  lat: number;
  lon: number;
}

export interface School {
  id: string;
  data: SchoolData;
}