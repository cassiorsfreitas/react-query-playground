import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicQueryExample from "@/components/basic-query-example";
import InvalidationExample from "@/components/invalidation-example";
import RefetchExample from "@/components/refetch-example";
import OptimisticUpdatesExample from "@/components/optimistic-updates-example";
import DependentQueriesExample from "@/components/dependent-queries-example";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">React Query Playground</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        A demonstration of React Query&apos;s key features, focusing on
        invalidation and refetching.
      </p>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Query</TabsTrigger>
          <TabsTrigger value="refetch">Refetch</TabsTrigger>
          <TabsTrigger value="invalidation">Invalidation</TabsTrigger>
          <TabsTrigger value="dependent">Dependent Queries</TabsTrigger>
          <TabsTrigger value="optimistic">Optimistic Updates</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="p-4 border rounded-md mt-2">
          <BasicQueryExample />
        </TabsContent>
        <TabsContent value="refetch" className="p-4 border rounded-md mt-2">
          <RefetchExample />
        </TabsContent>
        <TabsContent
          value="invalidation"
          className="p-4 border rounded-md mt-2"
        >
          <InvalidationExample />
        </TabsContent>
        <TabsContent value="dependent" className="p-4 border rounded-md mt-2">
          <DependentQueriesExample />
        </TabsContent>
        <TabsContent value="optimistic" className="p-4 border rounded-md mt-2">
          <OptimisticUpdatesExample />
        </TabsContent>
      </Tabs>
    </div>
  );
}
