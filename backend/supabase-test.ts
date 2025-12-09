import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const client = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const { data, error } = await client.from("events").select("*").limit(1);
  console.log({ data, error });
}

test();
