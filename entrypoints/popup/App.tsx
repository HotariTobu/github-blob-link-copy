import icon from '@/assets/icon.svg'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { options } from '@/storageItems'
import { toast, Toaster } from 'sonner'

const formSchema = z.object({
  linkSwitchThreshold: z.coerce.number().min(1),
  permalinkFirst: z.boolean(),
})
type FormValues = z.infer<typeof formSchema>

export const App = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkSwitchThreshold: 0,
      permalinkFirst: false,
    } satisfies FormValues,
    mode: 'all',
  })

  useEffect(() => {
    options.linkSwitchThreshold.getValue().then(value =>
      form.setValue('linkSwitchThreshold', value, {
        shouldValidate: true,
      })
    )
    options.permalinkFirst.getValue().then(value =>
      form.setValue('permalinkFirst', value, {
        shouldValidate: true,
      })
    )
  }, [])

  const handleSubmit = async (formValues: FormValues) => {
    await options.linkSwitchThreshold.setValue(formValues.linkSwitchThreshold)
    await options.permalinkFirst.setValue(formValues.permalinkFirst)
    toast('Saved!')
  }

  return (
    <div className="m-4 w-96 flex flex-col">
      <img
        className="mx-auto mt-6 mb-10 h-60 shadow-2xl"
        src={icon}
        alt="the extension icon"
      />
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="linkSwitchThreshold"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-baseline">
                  <FormLabel>Link switch threshold</FormLabel>
                  <FormControl>
                    <Input
                      className="w-32"
                      placeholder="threshold in milliseconds"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormDescription>
                  Copied links are switched when copied in this span.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="permalinkFirst"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Permalink is first</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormDescription>
                  Permalinks are copied first if the switch is on.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={!form.formState.isValid}>
            Save
          </Button>
        </form>
      </Form>
      <div className="flex flex-col items-center">
        <p>
          Powered by
          <Button className="h-6 p-1" variant="link" asChild>
            <a href="https://wxt.dev/" target="_blank">
              WXT
            </a>
          </Button>
        </p>
        <p>
          Components by
          <Button className="h-6 p-1" variant="link" asChild>
            <a href="https://ui.shadcn.com/" target="_blank">
              shadcn/ui
            </a>
          </Button>
        </p>
        <p>
          Icon by
          <Button className="h-6 p-1" variant="link" asChild>
            <a
              href="https://iconpacks.net/?utm_source=link-attribution&utm_content=13176"
              target="_blank"
            >
              Iconpacks
            </a>
          </Button>
        </p>
      </div>
      <Toaster />
    </div>
  )
}
